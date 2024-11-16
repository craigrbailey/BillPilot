import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';
import { format } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import IncomeSourceDialog from '../Income/IncomeSourceDialog';
import IncomeEntryDialog from '../Income/IncomeEntryDialog';

const Income = () => {
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [sourceDialog, setSourceDialog] = useState({ open: false, data: null });
  const [entryDialog, setEntryDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesData, entriesData] = await Promise.all([
        api.fetchIncomeSources(),
        api.fetchIncomeEntries(),
      ]);
      setIncomeSources(sourcesData);
      setIncomeEntries(entriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load income data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSourceSubmit = async (data) => {
    try {
      if (sourceDialog.data) {
        await api.updateIncomeSource(sourceDialog.data.id, data);
      } else {
        await api.createIncomeSource(data);
      }
      fetchData();
      setSourceDialog({ open: false, data: null });
    } catch (err) {
      setError('Failed to save income source');
      console.error(err);
    }
  };

  const handleEntrySubmit = async (data) => {
    try {
      if (entryDialog.data) {
        await api.updateIncomeEntry(entryDialog.data.id, data);
      } else {
        await api.createIncomeEntry(data);
      }
      fetchData();
      setEntryDialog({ open: false, data: null });
    } catch (err) {
      setError('Failed to save income entry');
      console.error(err);
    }
  };

  const handleDeleteSource = async (id) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      try {
        await api.deleteIncomeSource(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete income source');
        console.error(err);
      }
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await api.deleteIncomeEntry(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete income entry');
        console.error(err);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} direction="column">
        {/* Income Sources Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Income Sources</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setSourceDialog({ open: true, data: null })}
                variant="contained"
              >
                Add Source
              </Button>
            </Box>
            <List>
              {incomeSources.map((source) => (
                <ListItem key={source.id} divider>
                  <ListItemText
                    primary={source.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Expected: {formatAmount(source.amount)} ({source.frequency.toLowerCase()})
                        </Typography>
                        <Typography variant="body2">
                          Started: {format(new Date(source.startDate), 'MMM dd, yyyy')}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setSourceDialog({ open: true, data: source })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteSource(source.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {incomeSources.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No income sources added yet"
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Income History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Income History</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setEntryDialog({ open: true, data: null })}
                variant="contained"
              >
                Add Entry
              </Button>
            </Box>
            <List>
              {incomeEntries.map((entry) => (
                <ListItem key={entry.id} divider>
                  <ListItemText
                    primary={entry.isOneTime ? 'One-time Income' : entry.source?.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Amount: {formatAmount(entry.amount)}
                        </Typography>
                        <Typography variant="body2">
                          Date: {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </Typography>
                        {entry.description && (
                          <Typography variant="body2">
                            Note: {entry.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setEntryDialog({ open: true, data: entry })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {incomeEntries.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No income entries recorded yet"
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <IncomeSourceDialog
        open={sourceDialog.open}
        onClose={() => setSourceDialog({ open: false, data: null })}
        onSubmit={handleSourceSubmit}
        initialData={sourceDialog.data}
      />

      <IncomeEntryDialog
        open={entryDialog.open}
        onClose={() => setEntryDialog({ open: false, data: null })}
        onSubmit={handleEntrySubmit}
        initialData={entryDialog.data}
        incomeSources={incomeSources}
      />
    </Box>
  );
};

export default Income; 