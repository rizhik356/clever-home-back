import fastify from "fastify";
import fastifyCors from "@fastify/cors";

export default () => {
  const app = fastify();

  app.register(fastifyCors, {
    origin: "*", // Разрешить все источники. Настрой это по мере необходимости.
    methods: ["GET", "POST"], // Разрешенные методы
  });

  app.post("/sigin", (req, res) => {
    res.code(200).send("ok");
  });

  return app;
};
