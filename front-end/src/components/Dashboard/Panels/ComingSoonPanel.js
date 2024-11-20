import { Paper, Typography, Box } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const ComingSoonPanel = () => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <ConstructionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Coming Soon
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        New features and improvements are on the way!
      </Typography>
    </Paper>
  );
};

export default ComingSoonPanel; 