/**
 * Test API helper functions for making HTTP requests to the application endpoints.
 * Provides utilities for testing producer intervals and health check endpoints.
 */

import request from "supertest";
import { createApp } from "../../src/createApp";

export async function getProducerIntervals(csvFilePath?: string) {
  const app = await createApp(csvFilePath);
  const response = await request(app)
    .get("/api/producers/prize-intervals")
    .expect(200);
  return response.body;
}

export async function getHealthCheck() {
  const app = await createApp();
  const response = await request(app)
    .get("/health")
    .expect(200)
    .expect("Content-Type", /json/);
  return response.body;
}

export async function getProducerIntervalsResponse(csvFilePath?: string) {
  const app = await createApp(csvFilePath);
  return await request(app)
    .get("/api/producers/prize-intervals")
    .expect(200)
    .expect("Content-Type", /json/);
}
