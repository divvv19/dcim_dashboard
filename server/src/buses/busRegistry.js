const { createBusRecord } = require("../onboarding/contracts");

function createBusRegistry({ seedBuses = [], now = Date.now } = {}) {
  const buses = new Map();

  function create(busInput) {
    const bus = createBusRecord(busInput, now());

    if (buses.has(bus.busId)) {
      throw new Error(`Bus already exists: ${bus.busId}`);
    }

    buses.set(bus.busId, bus);
    return bus;
  }

  function update(busId, patch) {
    const existing = buses.get(busId);
    if (!existing) {
      throw new Error(`Bus not found: ${busId}`);
    }

    const updated = createBusRecord(
      {
        ...existing,
        ...patch,
        busId: existing.busId,
        createdAt: existing.createdAt,
      },
      now(),
    );

    buses.set(busId, updated);
    return updated;
  }

  function get(busId) {
    return buses.get(busId) ?? null;
  }

  function list() {
    return [...buses.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  function exists(busId) {
    return buses.has(busId);
  }

  for (const seedBus of seedBuses) {
    create(seedBus);
  }

  return {
    create,
    exists,
    get,
    list,
    update,
  };
}

module.exports = {
  createBusRegistry,
};
