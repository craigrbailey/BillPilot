import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { useTheme } from '@mui/material/styles';

const CategoryDialog = ({ open, onClose, onSubmit, initialData }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    color: '#808080',
  });
  const [error, setError] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        color: initialData.color || '#808080',
      });
    } else {
      setFormData({
        name: '',
        color: '#808080',
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color.hex,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }
      onSubmit(formData);
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to determine text color based on background color
  const getContrastText = (hexcolor) => {
    // Convert hex to RGB
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              name="name"
              label="Category Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <Box>
              <Box
                onClick={() => setShowColorPicker(!showColorPicker)}
                sx={{
                  width: '100%',
                  height: '40px',
                  backgroundColor: formData.color,
                  cursor: 'pointer',
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s',
                  color: getContrastText(formData.color),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
              >
                {formData.color.toUpperCase()}
              </Box>
              {showColorPicker && (
                <Box sx={{ 
                  position: 'absolute', 
                  zIndex: 2,
                  mt: 1,
                }}>
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                    }}
                    onClick={() => setShowColorPicker(false)}
                  />
                  <ChromePicker
                    color={formData.color}
                    onChange={handleColorChange}
                    styles={{
                      default: {
                        picker: {
                          backgroundColor: theme.palette.background.paper,
                          boxShadow: theme.shadows[8],
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!formData.name.trim()}
            sx={{
              backgroundColor: formData.color,
              color: getContrastText(formData.color),
              '&:hover': {
                backgroundColor: formData.color,
                opacity: 0.9,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryDialog; 