import { Tooltip, styled } from '@mui/material';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[4],
    padding: theme.spacing(1.5),
    maxWidth: 'none',
  },
}));

export default StyledTooltip; 