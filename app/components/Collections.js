'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CollectionsContext = createContext();

export function CollectionsProvider({ children }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = () => {
    try {
      const saved = localStorage.getItem('viraltrends_collections');
      if (saved) {
        setCollections(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCollections = (newCollections) => {
    try {
      localStorage.setItem('viraltrends_collections', JSON.stringify(newCollections));
      setCollections(newCollections);
    } catch (error) {
      console.error('Error saving collections:', error);
    }
  };

  const createCollection = (name, description = '') => {
    const newCollection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveCollections([...collections, newCollection]);
    return newCollection;
  };

  const deleteCollection = (collectionId) => {
    saveCollections(collections.filter(c => c.id !== collectionId));
  };

  const addToCollection = (collectionId, item, itemType) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        // Check if item already exists
        const exists = collection.items.some(i => 
          i.type === itemType && i.id === (item.video_url || item.product_id)
        );
        
        if (!exists) {
          return {
            ...collection,
            items: [...collection.items, {
              id: item.video_url || item.product_id,
              type: itemType,
              data: item,
              addedAt: new Date().toISOString()
            }],
            updatedAt: new Date().toISOString()
          };
        }
      }
      return collection;
    });
    saveCollections(updatedCollections);
  };

  const removeFromCollection = (collectionId, itemId) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          items: collection.items.filter(item => item.id !== itemId),
          updatedAt: new Date().toISOString()
        };
      }
      return collection;
    });
    saveCollections(updatedCollections);
  };

  const isItemInCollection = (collectionId, itemId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.items.some(item => item.id === itemId) : false;
  };

  const getItemCollections = (itemId) => {
    return collections.filter(collection => 
      collection.items.some(item => item.id === itemId)
    );
  };

  return (
    <CollectionsContext.Provider value={{
      collections,
      isLoading,
      createCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      isItemInCollection,
      getItemCollections
    }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
}

// Add to Collection Button Component
export function AddToCollectionButton({ item, itemType, size = 'medium' }) {
  const { collections, addToCollection, getItemCollections } = useCollections();
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const itemId = item.video_url || item.product_id;
  const itemCollections = getItemCollections(itemId);

  return (
    <div className="add-to-collection-container">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`add-to-collection-btn ${size}`}
        title="Add to Collection"
      >
        📚 {itemCollections.length > 0 && <span className="badge">{itemCollections.length}</span>}
      </button>

      {showMenu && (
        <>
          <div 
            className="collections-backdrop" 
            onClick={() => setShowMenu(false)}
          />
          <div className="collections-menu">
            <div className="collections-menu-header">
              <h4>Add to Collection</h4>
              <button 
                onClick={() => setShowMenu(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="collections-list">
              {collections.length === 0 ? (
                <div className="empty-state">
                  <p>No collections yet</p>
                  <p className="empty-hint">Create your first collection!</p>
                </div>
              ) : (
                collections.map(collection => (
                  <div 
                    key={collection.id} 
                    className="collection-item"
                    onClick={() => {
                      addToCollection(collection.id, item, itemType);
                      setShowMenu(false);
                    }}
                  >
                    <span className="collection-name">{collection.name}</span>
                    <span className="collection-count">{collection.items.length}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="create-collection-btn"
            >
              ➕ New Collection
            </button>
          </div>
        </>
      )}

      {showCreateForm && (
        <CreateCollectionForm 
          onClose={() => setShowCreateForm(false)}
          onCreated={(collection) => {
            addToCollection(collection.id, item, itemType);
            setShowCreateForm(false);
            setShowMenu(false);
          }}
        />
      )}

      <style jsx>{`
        .add-to-collection-container {
          position: relative;
        }

        .add-to-collection-btn {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          position: relative;
        }

        .add-to-collection-btn:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .add-to-collection-btn.small {
          padding: 4px 8px;
          font-size: 12px;
        }

        .badge {
          background: var(--primary-color);
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .collections-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .collections-menu {
          position: fixed;
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 250px;
          max-width: 300px;
          max-height: 400px;
          overflow: hidden;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .collections-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .collections-menu-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .close-btn:hover {
          background: var(--background-color);
        }

        .collections-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .collection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .collection-item:hover {
          background: var(--background-color);
        }

        .collection-name {
          font-size: 14px;
        }

        .collection-count {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--background-color);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 20px;
          color: var(--text-secondary);
        }

        .empty-state p {
          margin: 4px 0;
        }

        .empty-hint {
          font-size: 12px;
        }

        .create-collection-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0 0 8px 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .create-collection-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

// Create Collection Form Component
function CreateCollectionForm({ onClose, onCreated }) {
  const { createCollection } = useCollections();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      const collection = createCollection(name.trim(), description.trim());
      onCreated(collection);
    }
  };

  return (
    <>
      <div className="form-backdrop" onClick={onClose} />
      <div className="create-form">
        <h3>Create New Collection</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Collection Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Beauty Finds"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection for?"
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create
            </button>
          </div>
        </form>

        <style jsx>{`
          .form-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
          }

          .create-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-background);
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            z-index: 1002;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          }

          .create-form h3 {
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 500;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--background-color);
            color: var(--text-color);
            font-size: 14px;
            font-family: inherit;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
          }

          .form-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 20px;
          }

          .btn-cancel,
          .btn-create {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
          }

          .btn-cancel {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            color: var(--text-color);
          }

          .btn-cancel:hover {
            opacity: 0.8;
          }

          .btn-create {
            background: var(--primary-color);
            border: none;
            color: white;
          }

          .btn-create:hover {
            opacity: 0.9;
          }
        `}</style>
      </div>
    </>
  );
}

// Collections Manager Component
export function CollectionsManager() {
  const { collections, deleteCollection } = useCollections();
  const [selectedCollection, setSelectedCollection] = useState(null);

  return (
    <div className="collections-manager">
      <h2>📚 My Collections</h2>
      
      {collections.length === 0 ? (
        <div className="empty-collections">
          <p>No collections yet</p>
          <p className="hint">Start adding videos and products to collections!</p>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map(collection => (
            <div 
              key={collection.id} 
              className="collection-card"
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="collection-header">
                <h3>{collection.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this collection?')) {
                      deleteCollection(collection.id);
                    }
                  }}
                  className="delete-btn"
                >
                  🗑️
                </button>
              </div>
              {collection.description && (
                <p className="collection-description">{collection.description}</p>
              )}
              <div className="collection-stats">
                <span>{collection.items.length} items</span>
                <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCollection && (
        <CollectionDetailModal 
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}

      <style jsx>{`
        .collections-manager {
          padding: 20px;
        }

        .collections-manager h2 {
          margin: 0 0 24px 0;
        }

        .empty-collections {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .hint {
          font-size: 14px;
          margin-top: 8px;
        }

        .collections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .collection-card {
          background: var(--card-background);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .collection-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .collection-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .collection-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .delete-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .collection-description {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .collection-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}

function CollectionDetailModal({ collection, onClose }) {
  const { removeFromCollection } = useCollections();

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="collection-detail-modal">
        <div className="modal-header">
          <div>
            <h2>{collection.name}</h2>
            {collection.description && <p>{collection.description}</p>}
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          {collection.items.length === 0 ? (
            <div className="empty-state">No items in this collection</div>
          ) : (
            <div className="items-grid">
              {collection.items.map(item => (
                <div key={item.id} className="collection-item">
                  <div className="item-type">{item.type === 'video' ? '🎬' : '🛍️'}</div>
                  <div className="item-info">
                    <div className="item-title">
                      {item.data.video_username || item.data.name || 'Unknown'}
                    </div>
                    <div className="item-meta">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCollection(collection.id, item.id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1001;
          }

          .collection-detail-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-background);
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            z-index: 1002;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            padding: 24px;
            border-bottom: 1px solid var(--border-color);
          }

          .modal-header h2 {
            margin: 0 0 8px 0;
          }

          .modal-header p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 14px;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
          }

          .items-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .collection-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
          }

          .item-type {
            font-size: 24px;
          }

          .item-info {
            flex: 1;
          }

          .item-title {
            font-weight: 500;
            margin-bottom: 4px;
          }

          .item-meta {
            font-size: 12px;
            color: var(--text-secondary);
          }

          .remove-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;
          }

          .remove-btn:hover {
            opacity: 1;
          }
        `}</style>
      </div>
    </>
  );
}

