import React from 'react';
import { Button } from '../../../../../components/common/Button';
import { Card } from '../../../../../components/common/Card';
import { Flex } from '../../../../../components/common/Layout';
import { Modal } from '../../../../../components/common/Modal';
import { Typography } from '../../../../../components/common/Typography';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../../components/common/Table';
import { User, UserActivity } from './types';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  activities: UserActivity[];
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({
  isOpen,
  onClose,
  user,
  activities,
}) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Activity"
      size="large"
    >
      <div style={{ marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          {user.name} ({user.username})
        </Typography>
        <Typography>Showing recent activity for this user</Typography>
      </div>

      {activities.length === 0 ? (
        <Typography>No activity found for this user.</Typography>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Activity Type</TableHeaderCell>
                  <TableHeaderCell>Details</TableHeaderCell>
                  <TableHeaderCell>IP Address</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{activity.activity_type}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>{activity.ip_address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Flex justifyContent="end" gap="md" style={{ marginTop: '20px' }}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Flex>
    </Modal>
  );
};

export default UserActivityModal;