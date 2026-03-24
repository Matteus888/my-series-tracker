// lib/api/series.api.test.js
const { addTrackedSeries, getTrackedSeries, removeTrackedSeries } = require("./series.api");

describe("series.api.js", () => {
  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addTrackedSeries", () => {
    it("devrait ajouter une série au suivi si elle n'est pas déjà suivie", async () => {
      const mockUser = {
        _id: "user123",
        trackedSeries: [],
        save: jest.fn().mockResolvedValue({
          _id: "user123",
          trackedSeries: [
            {
              seriesId: "series123",
              status: "watching",
              lastWatched: { season: 1, episode: 1 },
              isFavorite: false,
              rating: null,
            },
          ],
        }),
      };
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await addTrackedSeries(mockUserModel, "user123", "series123", {
        status: "watching",
      });

      expect(mockUserModel.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          seriesId: "series123",
          status: "watching",
          lastWatched: { season: 1, episode: 1 },
          isFavorite: false,
          rating: null,
        },
      ]);
    });
  });

  describe("getTrackedSeries", () => {
    it("devrait récupérer les séries suivies par un utilisateur", async () => {
      const mockTrackedSeries = [
        {
          seriesId: {
            _id: "series123",
            title: "Ma Série",
            tmdbId: 12345,
          },
          status: "watching",
        },
      ];

      const mockUser = {
        _id: "user123",
        trackedSeries: mockTrackedSeries,
      };

      mockUserModel.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({
          _id: "user123",
          trackedSeries: mockTrackedSeries,
        }),
      }));

      const result = await getTrackedSeries(mockUserModel, "user123");

      expect(mockUserModel.findById).toHaveBeenCalledWith("user123");
      expect(result).toEqual(mockTrackedSeries);
    });
  });

  describe("removeTrackedSeries", () => {
    it("devrait retirer une série du suivi", async () => {
      const mockUser = {
        _id: "user123",
        trackedSeries: [
          {
            seriesId: "series123",
            status: "watching",
          },
        ],
        save: jest.fn().mockResolvedValue({
          _id: "user123",
          trackedSeries: [],
        }),
      };
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await removeTrackedSeries(mockUserModel, "user123", "series123");

      expect(mockUserModel.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });
});
