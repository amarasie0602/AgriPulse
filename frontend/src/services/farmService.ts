const useDemoMode =
  import.meta.env.VITE_USE_MOCK_AUTH === 'true'

export const farmService = {
  async getFarms() {
    if (useDemoMode) {
      return ...
    }

    const response = await api.get(...)
    return response.data
  },
}

