import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UserCard } from '../components/UserCard';

interface MockUser {
  id: number;
  name: string;
  username: string;
  plantCount: number;
}

const mockFriends: MockUser[] = [
  { id: 1, name: 'Amy', username: 'amy_gardens', plantCount: 14 },
  { id: 2, name: 'Marcus', username: 'marcus_green', plantCount: 8 },
];

const mockSuggestedUsers: MockUser[] = [
  { id: 3, name: 'Sarah', username: 'sarah_botanist', plantCount: 22 },
  { id: 4, name: 'James', username: 'james_plants', plantCount: 5 },
  { id: 5, name: 'Lisa', username: 'lisa_flora', plantCount: 18 },
];

export const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<MockUser[]>(mockFriends);
  const [suggestedUsers, setSuggestedUsers] = useState<MockUser[]>(mockSuggestedUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleAddFriend = (userId: number) => {
    const userToAdd = suggestedUsers.find((u) => u.id === userId);
    if (userToAdd) {
      setFriends([...friends, userToAdd]);
      setSuggestedUsers(suggestedUsers.filter((u) => u.id !== userId));
    }
  };

  const handleRemoveFriend = (userId: number) => {
    const userToRemove = friends.find((u) => u.id === userId);
    if (userToRemove) {
      setFriends(friends.filter((u) => u.id !== userId));
      setSuggestedUsers([...suggestedUsers, userToRemove]);
    }
  };

  const filteredSuggested = suggestedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px]">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--color-text)] hover:text-brand-terracotta mb-4"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl font-bold">Friends</h1>
          <p className="text-[var(--color-text-2)] text-sm">
            {friends.length} friend{friends.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* My Friends Section */}
        {friends.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
              My Friends
            </h2>

            <div className="space-y-2">
              {friends.map((friend) => (
                <UserCard
                  key={friend.id}
                  id={friend.id}
                  name={friend.name}
                  username={friend.username}
                  plantCount={friend.plantCount}
                  isConnected={true}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>
          </section>
        )}

        {/* Search Bar */}
        {!showSearch ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowSearch(true)}
            className="mb-6"
          >
            + Add Friend
          </Button>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-terracotta mb-2"
            />
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowSearch(false);
                setSearchTerm('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Suggested Users */}
        {showSearch && (
          <section>
            <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-4">
              {searchTerm ? 'Search Results' : 'Suggested Friends'}
            </h3>

            {filteredSuggested.length > 0 ? (
              <div className="space-y-2">
                {filteredSuggested.map((user) => (
                  <UserCard
                    key={user.id}
                    id={user.id}
                    name={user.name}
                    username={user.username}
                    plantCount={user.plantCount}
                    isConnected={false}
                    onConnect={handleAddFriend}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-[var(--color-text-2)] text-sm">
                  {searchTerm
                    ? 'No users found matching your search'
                    : 'No suggested users at this time'}
                </p>
              </Card>
            )}
          </section>
        )}

        {/* Empty State */}
        {!showSearch && friends.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-5xl mb-4">👥</p>
            <h3 className="font-display text-lg font-bold text-[var(--color-text)] mb-2">
              No friends yet
            </h3>
            <p className="text-[var(--color-text-2)] text-sm mb-4">
              Add friends to see their plant activity and connect with other plant lovers!
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowSearch(true)}
            >
              Find Friends
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
