function createSnapshotProjector({
  transportMode,
  getLegacyState,
  busRegistry,
  deviceStore,
  connectorState,
}) {
  function projectInventory() {
    const runtimeByDeviceId = new Map(
      connectorState.listDeviceRuntime().map((runtime) => [runtime.deviceId, runtime]),
    );
    const busRuntimeById = new Map(
      connectorState.listBusRuntime().map((runtime) => [runtime.busId, runtime]),
    );

    const devices = deviceStore.list().map((device) => {
      const runtime = runtimeByDeviceId.get(device.deviceId);
      return {
        deviceId: device.deviceId,
        name: device.name,
        site: device.site,
        rack: device.rack,
        deviceType: device.deviceType,
        busId: device.busId,
        slaveId: device.slaveId,
        lifecycle: device.lifecycle,
        pollingEligible: device.pollingEligible,
        online: runtime?.online ?? false,
        freshness: runtime?.freshness ?? "unknown",
        unsupportedMetrics: runtime?.unsupportedMetrics ?? [],
        lastSeenAt: runtime?.lastSuccessAt ?? null,
        lastError: runtime?.lastError ?? null,
        profile: {
          profileId: device.profileId,
          profileVersion: device.profileVersion,
          profileStatus: device.profileStatus,
        },
      };
    });

    const buses = busRegistry.list().map((bus) => {
      const runtime = busRuntimeById.get(bus.busId);
      return {
        ...bus,
        inFlight: runtime?.inFlight ?? false,
        lastActivityAt: runtime?.lastActivityAt ?? null,
        lastError: runtime?.lastError ?? null,
        deviceCount: devices.filter((device) => device.busId === bus.busId).length,
      };
    });

    return {
      transportMode,
      devices,
      buses,
      summary: {
        totalDevices: devices.length,
        onlineDevices: devices.filter((device) => device.online).length,
        pendingDevices: devices.filter((device) => device.lifecycle === "Pending").length,
        offlineDevices: devices.filter((device) => device.freshness === "offline").length,
      },
    };
  }

  function project() {
    return {
      ...getLegacyState(),
      inventory: projectInventory(),
    };
  }

  return {
    project,
  };
}

module.exports = {
  createSnapshotProjector,
};
