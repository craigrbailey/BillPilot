import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import * as api from '../../utils/api';
import CategoryDialog from '../Categories/CategoryDialog';
import CategoryAnalytics from '../Categories/CategoryAnalytics';
import { useNotification } from '../../contexts/NotificationContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { showNotification } = useNotification();

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
      showNotification('Category created successfully');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to create category', 'error');
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await api.updateCategory(selectedCategory.id, categoryData);
      await fetchData();
      setDialogOpen(false);
      setSelectedCategory(null);
      showNotification('Category updated successfully');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to update category', 'error');
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Add Category">
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
        </Tooltip>
      </Box>

      <CategoryAnalytics 
        categories={categories} 
        bills={bills}
      />

      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        initialData={selectedCategory}
      />
    </Box>
  );
};

export default Categories; 