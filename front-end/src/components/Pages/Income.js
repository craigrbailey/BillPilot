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
import {
  fetchIncomeSources,
  fetchIncomeEntries,
  fetchFuturePayments,
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  createIncomeEntry,
  updateIncomeEntry,
  deleteIncomeEntry
} from '../../utils/api/incomeAPI';
import { format } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import IncomeSourceDialog from '../Income/IncomeSourceDialog';
import IncomeEntryDialog from '../Income/IncomeEntryDialog';
import ConfirmationDialog from '../Common/ConfirmationDialog';

// Update the scrollable container style to work better in a row layout
const scrollableContainerStyle = {
  height: 'calc(100vh - 200px)', // Adjust height to fill available space
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'background.default',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'primary.main',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
  },
};

const Income = () => {
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [futurePayments, setFuturePayments] = useState([]);
  const [sourceDialog, setSourceDialog] = useState({ open: false, data: null });
  const [entryDialog, setEntryDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sourceId: null,
    sourceName: '',
  });
  const [deleteEntryDialog, setDeleteEntryDialog] = useState({
    open: false,
    entryId: null,
    entryName: '',
    amount: 0,
    date: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesData, entriesData, futureData] = await Promise.all([
        fetchIncomeSources(),
        fetchIncomeEntries(),
        fetchFuturePayments(),
      ]);
      setIncomeSources(sourcesData);
      setIncomeEntries(entriesData);
      setFuturePayments(futureData);
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
        await updateIncomeSource(sourceDialog.data.id, data);
      } else {
        await createIncomeSource(data);
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
        await updateIncomeEntry(entryDialog.data.id, data);
      } else {
        await createIncomeEntry(data);
      }
      fetchData();
      setEntryDialog({ open: false, data: null });
    } catch (err) {
      setError('Failed to save income entry');
      console.error(err);
    }
  };

  const handleDeleteSource = async (source) => {
    setDeleteDialog({
      open: true,
      sourceId: source.id,
      sourceName: source.name,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteIncomeSource(deleteDialog.sourceId);
      fetchData();
      setDeleteDialog({ open: false, sourceId: null, sourceName: '' });
    } catch (err) {
      setError('Failed to delete income source');
      console.error(err);
    }
  };

  const handleDeleteEntry = (entry) => {
    setDeleteEntryDialog({
      open: true,
      entryId: entry.id,
      entryName: entry.source?.name || entry.sourceName || 'One-time Income',
      amount: entry.amount,
      date: entry.date,
    });
  };

  const handleConfirmEntryDelete = async () => {
    try {
      await deleteIncomeEntry(deleteEntryDialog.entryId);
      fetchData();
      setDeleteEntryDialog({
        open: false,
        entryId: null,
        entryName: '',
        amount: 0,
        date: null,
      });
    } catch (err) {
      setError('Failed to delete income entry');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 100px)' }}>
        {/* Income Sources Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            <Box sx={scrollableContainerStyle}>
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
                        onClick={() => handleDeleteSource(source)}
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
            </Box>
          </Paper>
        </Grid>

        {/* Future Payments Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Payments
            </Typography>
            <Box sx={scrollableContainerStyle}>
              <List>
                {futurePayments.map((payment) => (
                  <ListItem key={payment.id} divider>
                    <ListItemText
                      primary={payment.source?.name || payment.sourceName}
                      secondary={
                        <>
                          <Typography variant="body2">
                            Amount: {formatAmount(payment.amount)}
                          </Typography>
                          <Typography variant="body2">
                            Due: {format(new Date(payment.date), 'MMM dd, yyyy')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {futurePayments.length === 0 && (
                  <ListItem>
                    <ListItemText
                      secondary="No upcoming payments scheduled"
                      sx={{ textAlign: 'center', fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Income History Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            <Box sx={scrollableContainerStyle}>
              <List>
                {incomeEntries.map((entry) => (
                  <ListItem key={entry.id} divider>
                    <ListItemText
                      primary={entry.source?.name || entry.sourceName || 'One-time Income'}
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
                        onClick={() => handleDeleteEntry(entry)}
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
            </Box>
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

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, sourceId: null, sourceName: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Income Source"
        message={`Are you sure you want to delete "${deleteDialog.sourceName}"? This will also delete all future payments associated with this source.`}
      />

      <ConfirmationDialog
        open={deleteEntryDialog.open}
        onClose={() => setDeleteEntryDialog({
          open: false,
          entryId: null,
          entryName: '',
          amount: 0,
          date: null,
        })}
        onConfirm={handleConfirmEntryDelete}
        title="Delete Income Entry"
        message={`Are you sure you want to delete the income entry "${deleteEntryDialog.entryName}" for ${formatAmount(deleteEntryDialog.amount)} from ${deleteEntryDialog.date ? format(new Date(deleteEntryDialog.date), 'MMM dd, yyyy') : ''}?`}
      />
    </Box>
  );
};

export default Income; 