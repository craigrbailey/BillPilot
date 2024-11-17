import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import * as api from '../../utils/api';
import CategoryDialog from '../Categories/CategoryDialog';
import CategoryAnalytics from '../Categories/CategoryAnalytics';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, billsData] = await Promise.all([
        api.fetchCategories(),
        api.fetchBills(),
      ]);
      setCategories(categoriesData);
      setBills(billsData);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (categoryData) => {
    try {
      await api.createCategory(categoryData);
      await fetchData();
      setDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await api.updateCategory(selectedCategory.id, categoryData);
      await fetchData();
      setDialogOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await api.deleteCategory(category.id);
      await fetchData();
      setDeleteDialog({ open: false, category: null });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Chart Section */}
      <CategoryAnalytics 
        categories={categories} 
        bills={bills}
      />

      {/* Categories List Section */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Categories</Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedCategory(null);
              setDialogOpen(true);
            }}
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        </Box>

        <List>
          {categories.map((category) => (
            <ListItem 
              key={category.id}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: category.color,
                  mr: 2,
                }}
              />
              <ListItemText 
                primary={category.name}
                secondary={`${bills.filter(bill => bill.categoryId === category.id).length} bills`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => setDeleteDialog({ open: true, category })}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        initialData={selectedCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{deleteDialog.category?.name}"?
            {bills.filter(bill => bill.categoryId === deleteDialog.category?.id).length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Warning: This category has associated bills. You'll need to reassign or delete them first.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, category: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteCategory(deleteDialog.category)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 