const calculateTrustLevel = (deviceType, os) => {
  const deviceWeights = {
    pc: 3,
    tablet: 2,
    phone: 1,
  };

  const osWeights = {
    macOS: 3,
    Windows: 2,
    Linux: 2,
    iOS: 1,
    Android: 1,
  };

  const totalScore = deviceWeights[deviceType] + osWeights[os];

  if (totalScore >= 5) {
    return "high";
  } else if (totalScore >= 3) {
    return "medium";
  } else {
    return "low";
  }
};

const generateContext = () => {
  // Fixed location data
  const location = {
    city: `${process.env.CITY || "Dhaka"}`,
    type: "Branch",
    country: `${process.env.COUNTRY || "BD"}`,
  };

  // Current time
  const time = new Date().toISOString();

  // Device data pool
  const deviceTypes = ["phone", "tablet", "pc"];
  const osTypes = ["Windows", "macOS", "Linux", "iOS", "Android"];
  const ipPool = ["192.168.1.1", "10.0.0.1", "172.16.0.1"];

  // Randomly pick one from each pool
  const deviceType =
    deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
  const os = osTypes[Math.floor(Math.random() * osTypes.length)];
  const ip = ipPool[Math.floor(Math.random() * ipPool.length)];

  // Calculate trust level based on device type and OS
  const trustLevel = calculateTrustLevel(deviceType, os);

  return {
    location: location,
    lastlogin: time,
    deviceTrustLevel: trustLevel,
  };
};

const fetchContext = async (req, res, next) => {
  const context = generateContext();
  req.context = context;
  next();
};

module.exports = { generateContext, fetchContext };
