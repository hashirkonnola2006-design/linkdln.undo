import mongoose from 'mongoose';

class MockQuery {
  constructor(data, collectionName) {
    this.data = data;
    this.collectionName = collectionName;
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key];
    
    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();
      
      if (valA < valB) return order === -1 ? 1 : -1;
      if (valA > valB) return order === -1 ? -1 : 1;
      return 0;
    });
    
    return this;
  }

  populate(field) {
    if (!field) return this;
    
    // Handle population for 'memberIds' in Jars
    if (field === 'memberIds') {
      this.data = this.data.map(item => {
        if (item.memberIds && Array.isArray(item.memberIds)) {
          const populated = item.memberIds.map(id => {
            const attendee = global.memoryDB.attendees.find(
              a => a._id.toString() === id.toString()
            );
            return attendee || id;
          });
          return { ...item, memberIds: populated };
        }
        return item;
      });
    }
    
    return this;
  }

  // Thenable interface makes it awaitable
  then(resolve) {
    resolve(this.data);
  }
}

const makeDoc = (item, collectionName) => {
  if (!item) return null;
  return {
    ...item,
    _id: item._id,
    toObject: () => item,
    save: async function() {
      const idx = global.memoryDB[collectionName].findIndex(
        x => x._id.toString() === item._id.toString()
      );
      if (idx !== -1) {
        global.memoryDB[collectionName][idx] = { ...this };
      }
      return this;
    }
  };
};

export const setupMemoryDB = (Model, collectionName) => {
  // If useMemoryDB is false, do not intercept Mongoose operations
  if (!global.useMemoryDB) return;

  console.log(`Setting up in-memory fallback for model: ${Model.modelName}`);

  // Mock static find
  Model.find = function(query) {
    let data = [...(global.memoryDB[collectionName] || [])];
    
    if (query) {
      if (query.visibility) {
        data = data.filter(item => item.visibility === query.visibility);
      }
      if (query.template && query.template !== 'All') {
        data = data.filter(item => item.template === query.template);
      }
      if (query.eventId) {
        data = data.filter(
          item => item.eventId && item.eventId.toString() === query.eventId.toString()
        );
      }
      if (query.$or) {
        data = data.filter(item => {
          return query.$or.some(condition => {
            const key = Object.keys(condition)[0];
            const value = condition[key];
            if (value && value.$regex) {
              const regex = new RegExp(value.$regex, value.$options);
              return regex.test(item[key]);
            }
            return item[key] === value;
          });
        });
      }
    }
    
    // Map data to document-like objects
    const docs = data.map(item => makeDoc(item, collectionName));
    return new MockQuery(docs, collectionName);
  };

  // Mock static findOne
  Model.findOne = function(query) {
    let data = [...(global.memoryDB[collectionName] || [])];
    
    if (query) {
      if (query.code) {
        data = data.filter(item => item.code === query.code);
      }
      if (query.email && query.eventId) {
        data = data.filter(
          item => item.email === query.email && item.eventId.toString() === query.eventId.toString()
        );
      }
      if (query.eventId && query.memberIds) {
        data = data.filter(
          item => item.eventId.toString() === query.eventId.toString() &&
                  item.memberIds &&
                  item.memberIds.some(id => id.toString() === query.memberIds.toString())
        );
      }
    }
    
    return data.length > 0 ? makeDoc(data[0], collectionName) : null;
  };

  // Mock static findById
  Model.findById = function(id) {
    if (!id) return null;
    const item = (global.memoryDB[collectionName] || []).find(
      x => x._id.toString() === id.toString()
    );
    return item ? makeDoc(item, collectionName) : null;
  };

  // Mock static findByIdAndUpdate
  Model.findByIdAndUpdate = function(id, update) {
    if (!id) return null;
    const idx = (global.memoryDB[collectionName] || []).findIndex(
      x => x._id.toString() === id.toString()
    );
    if (idx !== -1) {
      const current = global.memoryDB[collectionName][idx];
      // Mongoose update objects can be direct fields or operators like $set (we handle basic keys here)
      const updatedItem = { ...current, ...update };
      global.memoryDB[collectionName][idx] = updatedItem;
      return makeDoc(updatedItem, collectionName);
    }
    return null;
  };

  // Mock static countDocuments
  Model.countDocuments = function(query) {
    let data = [...(global.memoryDB[collectionName] || [])];
    if (query && query.eventId) {
      data = data.filter(
        item => item.eventId && item.eventId.toString() === query.eventId.toString()
      );
    }
    return data.length;
  };

  // Mock static deleteMany
  Model.deleteMany = function(query) {
    let items = global.memoryDB[collectionName] || [];
    if (query && query.eventId) {
      global.memoryDB[collectionName] = items.filter(
        item => !item.eventId || item.eventId.toString() !== query.eventId.toString()
      );
    } else if (query && query.code) {
      global.memoryDB[collectionName] = items.filter(item => item.code !== query.code);
    } else if (query && query._id) {
      global.memoryDB[collectionName] = items.filter(item => item._id?.toString() !== query._id?.toString());
    }
    return { deletedCount: 1 };
  };

  // Mock static deleteOne
  Model.deleteOne = function(query) {
    return Model.deleteMany(query);
  };

  // Mock instantiation save prototype
  Model.prototype.save = async function() {
    if (!this._id) {
      this._id = new mongoose.Types.ObjectId();
    }
    
    // Gather fields from mongoose document instance
    const obj = { ...this.toObject(), _id: this._id };
    
    const idx = (global.memoryDB[collectionName] || []).findIndex(
      x => x._id.toString() === this._id.toString()
    );
    
    if (idx !== -1) {
      global.memoryDB[collectionName][idx] = obj;
    } else {
      global.memoryDB[collectionName].push(obj);
    }
    
    // Make it doc-like on return
    return makeDoc(obj, collectionName);
  };
};
