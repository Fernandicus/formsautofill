## Example 1: Basic UI Wrappers

**❌ INCORRECT (Monolithic):**

```typescript 
export const UserProfile = ({ user }: { user: UserData }) => (
  <div className="rounded-borders p-4 bg-primary shadow-sm">
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>
);
```

**✅ CORRECT (Reusable wrapper):**

```typescript 
export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-borders p-4 bg-primary shadow-sm">{children}</div>
);

export const UserProfile = ({ user }: { user: UserData }) => (
  <Card>
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </Card>
);
```

## Example 2: Modals and Overlays

**❌ INCORRECT (Hardcodes the overlay and modal structure inside the specific feature):**

```typescript 
export const DeleteProductModal = ({ product, isOpen, onClose }: DeleteModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2">X</button>
        <h2>Are you sure you want to delete {product.name}?</h2>
        <Button variant="danger">Confirm Delete</Button>
      </div>
    </div>
  );
};
```

**✅ CORRECT (Separates the generic backdrop/modal logic from the domain content):**

```typescript 
export const ModalWrapper = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2">X</button>
        {children}
      </div>
    </div>
  );
};

export const DeleteProductModal = ({ product, isOpen, onClose }: DeleteModalProps) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose}>
    <h2>Are you sure you want to delete {product.name}?</h2>
    <Button variant="danger">Confirm Delete</Button>
  </ModalWrapper>
);
```

## Example 3: Page Layouts and Sections

**❌ INCORRECT (Hardcodes the overlay and modal structure inside the specific feature):**

```typescript 
export const DeleteProductModal = ({ product, isOpen, onClose }: DeleteModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2">X</button>
        <h2>Are you sure you want to delete {product.name}?</h2>
        <Button variant="danger">Confirm Delete</Button>
      </div>
    </div>
  );
};
```

**✅ CORRECT (Separates the generic backdrop/modal logic from the domain content):**

```typescript 
export const ModalWrapper = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2">X</button>
        {children}
      </div>
    </div>
  );
};

export const DeleteProductModal = ({ product, isOpen, onClose }: DeleteModalProps) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose}>
    <h2>Are you sure you want to delete {product.name}?</h2>
    <Button variant="danger">Confirm Delete</Button>
  </ModalWrapper>
);
```