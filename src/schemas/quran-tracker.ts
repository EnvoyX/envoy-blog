import { z } from "zod"

export const quranTrackSchema = z.object({
    currentSurah : z.string().min(1, "Surah is required"),
    currentAyat  : z.string().min(1, "Ayat is required"),
    currentJuz   : z.string().min(1, "Juz is required"),
})
