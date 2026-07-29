import { useCallback, useEffect } from 'react';
import usePersistentState, { numberStorage } from './usePersistentState';
import {
  addDaysToDateKey,
  createSimulationTimestamp,
  toLocalDateKey,
} from '../utils/simulationDate';

const createDailyBalance = date => ({
  date,
  income: 0,
  expenses: 0,
  entries: [],
});

const useDayClock = (setMessage) => {
  const [simulationStartDate] = usePersistentState(
    'simulationStartDate',
    toLocalDateKey,
  );
  const [currentDay, setCurrentDay] = usePersistentState(
    'currentDay',
    1,
    numberStorage,
  );
  const currentDate = addDaysToDateKey(simulationStartDate, currentDay - 1);
  const [dailyBalance, setDailyBalance] = usePersistentState(
    'dailyBalance',
    () => createDailyBalance(currentDate),
  );
  const [globalBalance, setGlobalBalance] = usePersistentState('globalBalance', {
    income: 0,
    expenses: 0,
    entries: [],
  });
  const [dayConfig, setDayConfig] = usePersistentState('dayConfig', {
    startHour: 6,
    endHour: 4,
    canSleepFromHour: 22,
    speedMultiplier: 60,
  });
  const [currentDayTime, setCurrentDayTime] = usePersistentState(
    'currentDayTime',
    dayConfig.startHour,
    numberStorage,
  );
  const [isClockRunning, setIsClockRunning] = usePersistentState(
    'isClockRunning',
    false,
  );
  const currentTimestamp = createSimulationTimestamp(currentDate, currentDayTime);

  useEffect(() => {
    setDailyBalance(previous =>
      previous.date === currentDate ? previous : { ...previous, date: currentDate }
    );
  }, [currentDate, setDailyBalance]);

  const finishDay = useCallback(() => {
    const netBalance = dailyBalance.income - dailyBalance.expenses;

    setGlobalBalance(previous => ({
      income: previous.income + dailyBalance.income,
      expenses: previous.expenses + dailyBalance.expenses,
      entries: [
        ...previous.entries,
        {
          id: `day-${currentDay}-transfer-${Date.now()}`,
          type: netBalance >= 0 ? 'income' : 'expense',
          amount: Math.abs(netBalance),
          description: `Balance del Día ${currentDay}`,
          timestamp: currentTimestamp,
        },
      ],
    }));
    const nextDate = addDaysToDateKey(currentDate, 1);
    setDailyBalance(createDailyBalance(nextDate));
    setCurrentDay(previous => previous + 1);
    setCurrentDayTime(dayConfig.startHour);
    setIsClockRunning(false);
    setMessage(
      `Día ${currentDay} finalizado. Balance transferido al global: $${netBalance.toFixed(2)}`,
    );
  }, [
    currentDay,
    currentDate,
    currentTimestamp,
    dailyBalance,
    dayConfig.startHour,
    setCurrentDay,
    setCurrentDayTime,
    setDailyBalance,
    setGlobalBalance,
    setIsClockRunning,
    setMessage,
  ]);

  useEffect(() => {
    if (!isClockRunning) return undefined;

    const interval = setInterval(() => {
      setCurrentDayTime(previous => {
        const increment = (1 / 60) * (dayConfig.speedMultiplier / 60);
        let nextTime = previous + increment;

        if (nextTime >= 24) nextTime -= 24;

        const { startHour, endHour } = dayConfig;
        const reachedEndHour = endHour < startHour
          ? (previous < endHour && nextTime >= endHour)
            || (previous >= startHour && nextTime >= 24)
          : previous < endHour && nextTime >= endHour;

        if (reachedEndHour) {
          setTimeout(finishDay, 100);
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dayConfig, finishDay, isClockRunning, setCurrentDayTime]);

  const canSleep = useCallback(() => {
    const { canSleepFromHour, startHour, endHour } = dayConfig;
    return endHour < startHour
      ? currentDayTime >= canSleepFromHour || currentDayTime <= endHour
      : currentDayTime >= canSleepFromHour && currentDayTime <= endHour;
  }, [currentDayTime, dayConfig]);

  return {
    dailyBalance,
    setDailyBalance,
    globalBalance,
    setGlobalBalance,
    dayConfig,
    setDayConfig,
    currentDayTime,
    isClockRunning,
    setIsClockRunning,
    currentDay,
    currentDate,
    currentTimestamp,
    finishDay,
    canSleep,
  };
};

export default useDayClock;
