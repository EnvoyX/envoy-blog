import { db } from '@/lib/db'
import { authMiddleware } from '@/middlewares/auth'
import { quranTrackSchema } from '@/schemas/quran-tracker'
import { differenceInHours } from 'date-fns'
import { createServerFn } from '@tanstack/react-start'
import { getCurrentDate } from '@/lib/utils'

export const savedQuranProgressFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(quranTrackSchema)
  .handler(async ({ data, context }) => {
    const existingProgress = await db.quranTrack.findUnique({
      where: {
        userId: context.user.id as string,
      },
    })

    const currentDate = getCurrentDate()

    function updateStreak(
      currentDate: Date,
      lastUpdated: Date,
      streak: number,
    ) {
      if (differenceInHours(currentDate, lastUpdated) >= 24) return 1
      return streak + 1
    }

    if (!existingProgress) {
      await db.quranTrack.create({
        data: {
          userId: context.user.id as string,
          currentSurah: data.currentSurah,
          currentAyat: data.currentAyat,
          currentJuz: data.currentJuz,
          currentStreak: 1,
        },
      })
    }

    await db.quranTrack.update({
      where: {
        userId: context.user.id as string,
      },
      data: {
        currentSurah: data.currentSurah,
        currentAyat: data.currentAyat,
        currentJuz: data.currentJuz,
        currentStreak: updateStreak(
          currentDate,
          existingProgress?.updatedAt as Date,
          existingProgress?.currentStreak as number,
        ),
      },
    })
  })

export const fetchCurrentQuranProgressFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const existingProgress = await db.quranTrack.findUnique({
      where: {
        userId: context.user.id as string,
      },
    })
    return existingProgress
  })
