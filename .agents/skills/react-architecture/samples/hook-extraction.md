## Hook Extraction

**Before (Bloated Component):**
```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Spinner />;
  return <div>{user.name}</div>;
}
```

**After (Extracted to Hook):**
```tsx
// hooks/useUserProfile.ts
function useUserProfile(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);
  
  return { user, loading };
}

// components/UserProfile.tsx
function UserProfile({ userId }) {
  const { user, loading } = useUserProfile(userId);

  if (loading) return <Spinner />;
  return <div>{user.name}</div>;
}
```
