// Alternative filter structures to try for entity-reference attributes

// Option 1: Using target_object field
const option1 = {
  filter: {
    list_entries: {
      target_object: {
        $includes: [this.syncConfig.attioObjectId],
      },
    },
  },
};

// Option 2: Using id field directly
const option2 = {
  filter: {
    list_entries: {
      id: {
        $contains: [this.syncConfig.attioObjectId],
      },
    },
  },
};

// Option 3: Using $any operator
const option3 = {
  filter: {
    list_entries: {
      $any: {
        id: this.syncConfig.attioObjectId,
      },
    },
  },
};

// Option 4: Using $has operator
const option4 = {
  filter: {
    list_entries: {
      $has: this.syncConfig.attioObjectId,
    },
  },
};

// Option 5: Direct comparison
const option5 = {
  filter: {
    list_entries: this.syncConfig.attioObjectId,
  },
};
