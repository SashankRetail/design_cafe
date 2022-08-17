const { ApolloServer } = require("apollo-server");
import { schema } from "./api/schema";
import { dataSources } from "./api/datasources";
import config from "./config";
require("dotenv").config();

const server = new ApolloServer({
  schema,
  dataSources,
  context: async ({ req }) => req,
});
// The `listen` method launches a web server.
server.listen({ port: config.PORT }).then(({ url }) => {
  console.log(`:rocket:  Server ready at ${url}`);
});
