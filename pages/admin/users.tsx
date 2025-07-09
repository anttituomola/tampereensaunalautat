import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

import ProtectedRoute from '../../components/ProtectedRoute';
import { authAPI, UserWithStats } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load users
  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const usersData = await authAPI.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Virhe ladattaessa käyttäjiä');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiivinen';
      case 'inactive':
        return 'Passiivinen';
      case 'pending':
        return 'Odottaa';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI');
  };

  if (!user?.isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Container>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='50vh'
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Container>
          <Box sx={{ py: 4 }}>
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant='contained' onClick={loadUsers}>
              Yritä uudelleen
            </Button>
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth='lg'>
        <Head>
          <title>Käyttäjähallinta - Admin - Tampereensaunalautat.fi</title>
          <meta
            name='description'
            content='Hallitse käyttäjiä ja heidän saunojaan'
          />
        </Head>

        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={4}
          >
            <Typography variant='h4' component='h1'>
              Käyttäjähallinta
            </Typography>
            <Button
              variant='outlined'
              onClick={() => router.push('/dashboard')}
            >
              Takaisin hallintapaneeliin
            </Button>
          </Box>

          {/* Statistics */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='primary'>
                {users.length}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Käyttäjää yhteensä
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='success.main'>
                {users.filter((u) => u.status === 'active').length}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Aktiivista käyttäjää
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='warning.main'>
                {users.filter((u) => u.is_admin).length}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Ylläpitäjää
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='h4' color='secondary.main'>
                {users.reduce((sum, u) => sum + u.sauna_count, 0)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Saunaa yhteensä
              </Typography>
            </Paper>
          </Box>

          {/* Users Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Käyttäjä</TableCell>
                    <TableCell>Sähköposti</TableCell>
                    <TableCell>Rooli</TableCell>
                    <TableCell>Tila</TableCell>
                    <TableCell align='center'>Saunat</TableCell>
                    <TableCell>Liittynyt</TableCell>
                    <TableCell align='center'>Toiminnot</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow
                      key={userData.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={2}>
                          <Avatar
                            sx={{
                              bgcolor: userData.is_admin
                                ? 'warning.main'
                                : 'primary.main',
                            }}
                          >
                            {userData.is_admin ? <AdminIcon /> : <PersonIcon />}
                          </Avatar>
                          <Typography variant='body2'>
                            {userData.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          <EmailIcon fontSize='small' color='action' />
                          <Typography variant='body2'>
                            {userData.email}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {userData.is_admin ? (
                          <Chip
                            icon={<AdminIcon />}
                            label='Ylläpitäjä'
                            color='warning'
                            size='small'
                          />
                        ) : (
                          <Chip
                            icon={<PersonIcon />}
                            label='Käyttäjä'
                            color='default'
                            size='small'
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(userData.status)}
                          color={getStatusColor(userData.status)}
                          size='small'
                        />
                      </TableCell>

                      <TableCell align='center'>
                        <Chip
                          label={userData.sauna_count.toString()}
                          color={
                            userData.sauna_count > 0 ? 'primary' : 'default'
                          }
                          size='small'
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatDate(userData.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell align='center'>
                        <Tooltip title='Näytä käyttäjän tiedot'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              // In future: open user details dialog
                              console.log('View user details:', userData.id);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {users.length === 0 && (
            <Box textAlign='center' py={4}>
              <Typography variant='body1' color='text.secondary'>
                Ei käyttäjiä löytynyt.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </ProtectedRoute>
  );
};

export default UsersManagement;
