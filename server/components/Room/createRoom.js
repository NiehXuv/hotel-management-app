import { database } from "../config/firebaseconfig.js";
import { ref, set, get, update, remove } from "firebase/database";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudflare R2 Client (S3-compatible)
const r2Client = new S3Client({
    region: 'auto', // R2 uses 'auto' for region
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true // Required for R2
});

const createRoom = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { 
            RoomType = '', 
            RoomName = '', 
            Description = '', 
            PriceByHour = 0, 
            PriceByNight = 0, 
            PriceBySection = 0, 
            RoomNumber,
            Floor
        } = req.body;

        if (!hotelId || !RoomNumber || !RoomType || !RoomName || !Description) {
            return res.status(400).json({ 
                success: false,
                error: 'Hotel ID, Room Number, Room Type, Room Name, and Description are required' 
            });
        }

        if (!Floor) {
            return res.status(400).json({ 
                success: false,
                error: 'Floor number is required' 
            });
        }

        if (RoomType.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Room Type must be at least 2 characters' 
            });
        }
        if (RoomName.trim().length < 2) {
            return res.status(400).json({ 
                success: false,
                error: 'Room Name must be at least 2 characters' 
            });
        }
        if (Description.trim().length < 10) {
            return res.status(400).json({ 
                success: false,
                error: 'Description must be at least 10 characters' 
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({ 
                success: false,
                error: 'Hotel not found' 
            });
        }

        const roomTypesRef = ref(database, `Hotel/${hotelId}/RoomTypes`);
        const roomTypesSnapshot = await get(roomTypesRef);
        let matchedRoomType = null;
        if (roomTypesSnapshot.exists()) {
            const roomTypes = roomTypesSnapshot.val();
            matchedRoomType = Object.values(roomTypes).find(rt => rt.Type === RoomType.trim());
        }

        if (!matchedRoomType) {
            return res.status(400).json({
                success: false,
                error: `Room Type '${RoomType}' not found in hotel's RoomTypes`
            });
        }

        const finalPriceByHour = PriceByHour !== 0 ? Number(PriceByHour) : matchedRoomType.PriceByHour;
        const finalPriceByNight = PriceByNight !== 0 ? Number(PriceByNight) : matchedRoomType.PriceByNight;
        const finalPriceBySection = PriceBySection !== 0 ? Number(PriceBySection) : matchedRoomType.PriceBySection;

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${RoomNumber}`);
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
            return res.status(400).json({ 
                success: false,
                error: 'Room number already exists' 
            });
        }

        await set(roomRef, {
            RoomType: RoomType.trim(),
            RoomName: RoomName.trim(),
            Description: Description.trim(),
            PriceByHour: finalPriceByHour,
            PriceByNight: finalPriceByNight,
            PriceBySection: finalPriceBySection,
            RoomNumber: RoomNumber.trim(),
            Floor: Floor.trim(),
            Status: 'Available',
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            ActivityCounter: 0,
            IssueCounter: 0,
        });

        return res.status(201).json({
            success: true,
            data: { roomId: RoomNumber, hotelId },
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Error creating room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomNumber: req.body.RoomNumber
        });
        const errorMessage = error.code === 'PERMISSION_DENIED' ? 'Permission denied' : 'Internal Server Error';
        return res.status(500).json({ 
            success: false,
            error: errorMessage 
        });
    }
};

const getHotelIds = async (req, res) => {
    try {
        const hotelsRef = ref(database, 'Hotel');
        const snapshot = await get(hotelsRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No hotels found'
            });
        }

        const hotels = snapshot.val();
        const hotelList = Object.entries(hotels).map(([id, data]) => ({
            id,
            name: data.Name || `Hotel ${id}`
        }));

        return res.status(200).json({
            success: true,
            data: hotelList,
            message: 'Hotel IDs retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching hotel IDs:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

const getRoomTypes = async (req, res) => {
    try {
        const { hotelId } = req.params;

        if (!hotelId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID is required'
            });
        }

        const roomTypesRef = ref(database, `Hotel/${hotelId}/RoomTypes`);
        const snapshot = await get(roomTypesRef);

        if (!snapshot.exists()) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No room types found for this hotel'
            });
        }

        const roomTypes = snapshot.val();
        const roomTypeList = Object.values(roomTypes).map(roomType => ({
            type: roomType.Type,
            priceByHour: roomType.PriceByHour,
            priceBySection: roomType.PriceBySection,
            priceByNight: roomType.PriceByNight
        }));

        return res.status(200).json({
            success: true,
            data: roomTypeList,
            message: 'Room types retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching room types:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId
        });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

const showRoom = async (req, res) => {
    try {
        const { hotelId, roomId } = req.params;

        if (!hotelId || !roomId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID and Room ID are required'
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomId}`);
        const roomSnapshot = await get(roomRef);
        
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const roomData = roomSnapshot.val();
        
        const activities = roomData.Activity
            ? Object.entries(roomData.Activity).map(([id, activity]) => ({
                ActivityId: id,
                Action: activity.Action,
                Details: activity.Details,
                User: activity.User,
                Timestamp: activity.Timestamp,
              }))
            : [];

        const issues = roomData.Issue
            ? Object.entries(roomData.Issue).map(([id, issue]) => ({
                IssueId: id,
                Description: issue.Description,
                Status: issue.Status,
                ReportedAt: issue.ReportedAt,
              }))
            : [];

        const imagesRef = ref(database, `Hotel/${hotelId}/Room/${roomId}/Images`);
        const imagesSnapshot = await get(imagesRef);
        const images = imagesSnapshot.exists()
            ? Object.entries(imagesSnapshot.val()).map(([id, url]) => ({
                ImageId: id,
                url: url
              }))
            : [];

        const roomResponse = {
            hotelId,
            roomId,
            roomType: roomData.RoomType,
            roomName: roomData.RoomName,
            description: roomData.Description,
            priceByHour: roomData.PriceByHour,
            priceByNight: roomData.PriceByNight,
            priceBySection: roomData.PriceBySection,
            roomNumber: roomData.RoomNumber,
            floor: roomData.Floor,
            status: roomData.Status,
            createdAt: roomData.CreatedAt,
            updatedAt: roomData.UpdatedAt,
            activityCounter: roomData.ActivityCounter || 0,
            issueCounter: roomData.IssueCounter || 0,
            activities,
            issues,
            images
        };

        return res.status(200).json({
            success: true,
            data: roomResponse,
            message: 'Room retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching room:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomId: req.params.roomId
        });
        
        const errorMessage = error.code === 'PERMISSION_DENIED' 
            ? 'Permission denied' 
            : 'Internal Server Error';
            
        return res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

const uploadImage = async (req, res) => {
    try {
        const { hotelId, roomId } = req.params;

        if (!hotelId || !roomId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID and Room ID are required'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Image file is required'
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomId}`);
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const file = req.file;
        const storagePath = `hotels/${hotelId}/rooms/${roomId}/images/${Date.now()}_${file.originalname}`;

        const uploadParams = {
            Bucket: process.env.R2_BUCKET,
            Key: storagePath,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        console.log('Uploading image to Cloudflare R2:', {
            storagePath,
            fileSize: file.size,
            mimeType: file.mimetype,
            bucket: process.env.R2_BUCKET
        });

        await r2Client.send(new PutObjectCommand(uploadParams));
        console.log('Image uploaded successfully to R2');

        // Generate a permanent URL using the R2.dev subdomain
        const downloadURL = `${process.env.R2_DEV_URL}/${storagePath}`;
        console.log('Permanent Download URL:', downloadURL);

        const imagesRef = ref(database, `Hotel/${hotelId}/Room/${roomId}/Images`);
        const imagesSnapshot = await get(imagesRef);
        let nextId = 1;
        if (imagesSnapshot.exists()) {
            const imageIds = Object.keys(imagesSnapshot.val()).map(id => parseInt(id));
            nextId = Math.max(...imageIds) + 1;
        }

        const imageEntryRef = ref(database, `Hotel/${hotelId}/Room/${roomId}/Images/${nextId}`);
        await set(imageEntryRef, downloadURL);

        return res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            ImageId: nextId.toString(),
            url: downloadURL
        });
    } catch (error) {
        console.error('Error uploading image:', {
            error: error.message,
            code: error.code,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomId: req.params.roomId,
            serverResponse: error.serverResponse || 'No server response'
        });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

// New endpoint to delete an image (from the gallery)
const deleteImage = async (req, res) => {
    try {
        const { hotelId, roomId, imageId } = req.params;

        if (!hotelId || !roomId || !imageId) {
            return res.status(400).json({
                success: false,
                error: 'Hotel ID, Room ID, and Image ID are required'
            });
        }

        const hotelRef = ref(database, `Hotel/${hotelId}`);
        const hotelSnapshot = await get(hotelRef);
        if (!hotelSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const roomRef = ref(database, `Hotel/${hotelId}/Room/${roomId}`);
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const imageEntryRef = ref(database, `Hotel/${hotelId}/Room/${roomId}/Images/${imageId}`);
        const imageSnapshot = await get(imageEntryRef);
        if (!imageSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }

        const imageUrl = imageSnapshot.val();

        // Extract the R2 key from the URL
        const url = new URL(imageUrl);
        const key = decodeURIComponent(url.pathname.substring(url.pathname.indexOf(`hotels/${hotelId}/rooms/${roomId}/images/`)));

        // Delete from Cloudflare R2
        const deleteParams = {
            Bucket: process.env.R2_BUCKET,
            Key: key,
        };

        console.log('Deleting image from Cloudflare R2:', { key, bucket: process.env.R2_BUCKET });
        await r2Client.send(new DeleteObjectCommand(deleteParams));
        console.log('Image deleted successfully from R2');

        // Remove the image URL from the database
        await remove(imageEntryRef);

        return res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image:', {
            error: error.message,
            stack: error.stack,
            hotelId: req.params.hotelId,
            roomId: req.params.roomId,
            imageId: req.params.imageId
        });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

export {
    createRoom,
    getHotelIds,
    getRoomTypes,
    showRoom,
    uploadImage,
    deleteImage
};