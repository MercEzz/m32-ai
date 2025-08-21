interface Config {
  port: number;
  nodeEnv?: string;
  mongoUri?: string;
  openAIKey?: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI,
  openAIKey: process.env.OPENAI_API_KEY,
};

export default config;
