interface Config {
  port: number;
  nodeEnv?: string;
  mongoUri?: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
};

export default config;
