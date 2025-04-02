import { useNavigate } from 'react-router-dom'
import Button from './Button'

const BackButton = ({ target = '/', label = '⬅️ Back', variant = 'text', size = 'sm' }) => {
    const navigate = useNavigate()
    return (
        <Button
          onClick={() => navigate(target)}
          variant={variant}
          size={size}
          className="gap-1"
        >
          {label}
        </Button>
      )
    }
    
    export default BackButton