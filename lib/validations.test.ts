import { describe, expect, it } from "vitest";
import { congratulationSchema } from "./validations";

describe("congratulationSchema", () => {
  it("should accept valid text congratulation", () => {
    const data = {
      author_name: "John Doe",
      type: "text",
      message: "Happy 50th birthday!",
    };
    const result = congratulationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject empty author name", () => {
    const data = {
      author_name: "",
      type: "text",
    };
    const result = congratulationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should accept audio type with file", () => {
    const file = new File(["audio content"], "audio.webm", { type: "audio/webm" });
    const data = {
      author_name: "Jane",
      type: "audio",
      media_file: file,
    };
    const result = congratulationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should accept video type with file", () => {
    const file = new File(["video content"], "video.mp4", { type: "video/mp4" });
    const data = {
      author_name: "Bob",
      type: "video",
      media_file: file,
    };
    const result = congratulationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject invalid type", () => {
    const data = {
      author_name: "Alice",
      type: "invalid" as unknown as "text" | "audio" | "video",
    };
    const result = congratulationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
