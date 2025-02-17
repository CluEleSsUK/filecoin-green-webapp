import { useMemo, useState } from 'react';
import cn from 'classnames';

import getWeeksInMonth from 'date-fns/getWeeksInMonth';
import getDayNumber from 'date-fns/getDate';
import addDays from 'date-fns/addDays';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import startOfWeek from 'date-fns/startOfWeek';
import add from 'date-fns/add';
import sub from 'date-fns/sub';
import set from 'date-fns/set';
import format from 'date-fns/format';
import isWithinInterval from 'date-fns/isWithinInterval';
import isValidDate from 'date-fns/isValid';

import { Svg } from 'components/Svg';
import s from './s.module.css';
import { MAX_DATEPICKER_DATE } from 'constant';

const MONTH = {
  CURRENT: 'current',
  PREV: 'prev',
  NEXT: 'next',
};

const getDayMonthType = (dayDate, date) => {
  const diff = differenceInCalendarMonths(date, dayDate);

  if (diff < 0) return MONTH.NEXT;
  if (diff > 0) return MONTH.PREV;

  return MONTH.CURRENT;
};

export const Month = ({
  start,
  interval,
  onChange,
  hoverDate,
  onChangeHoverDate,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(
    start ? interval.start : interval.end
  );

  const calendarMonthDays = useMemo(() => {
    const calendarDaysInMonth = getWeeksInMonth(calendarMonth) * 7;
    const firstDayInCalendarWeek = startOfWeek(set(calendarMonth, { date: 1 }));

    return Array.from({ length: calendarDaysInMonth }).map((_, idx) => {
      const dayDate = addDays(firstDayInCalendarWeek, idx);

      return {
        date: dayDate,
        dayNumber: getDayNumber(dayDate),
        // weekDayNumber: getWeekdayNumber(dayDate),
        monthType: getDayMonthType(dayDate, calendarMonth),
      };
    });
  }, [calendarMonth.getTime()]);

  const handlerPrevMonth = () => {
    setCalendarMonth((prevState) => sub(prevState, { months: 1 }));
  };

  const handlerNextMonth = () => {
    setCalendarMonth((prevState) => add(prevState, { months: 1 }));
  };

  const isDayInRange = (dayDate) => {
    if (
      !isValidDate(interval.start) ||
      !isValidDate(interval.end) ||
      !isValidDate(dayDate)
    ) {
      return false;
    }

    return isWithinInterval(
      set(dayDate, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      }),
      interval
    );
  };

  const isDayInPreviewRange = (dayDate) => {
    const endDate = interval.end || hoverDate;

    if (
      !isValidDate(interval.start) ||
      isValidDate(interval.end) ||
      !isValidDate(endDate) ||
      !isValidDate(dayDate) ||
      !isValidDate(hoverDate)
    ) {
      return false;
    }

    return isWithinInterval(
      set(dayDate, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      }),
      interval.start > endDate
        ? { start: endDate, end: interval.start }
        : { start: interval.start, end: endDate }
    );
  };

  const isSameDay = (dateLeft, dateRight) => {
    if (!isValidDate(dateLeft) || !isValidDate(dateRight)) {
      return false;
    }

    const normalizeDate = (date) => {
      return set(date, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }).getTime();
    };

    return normalizeDate(dateLeft) === normalizeDate(dateRight);
  };

  const isSameMonth = (dateLeft, dateRight) => {
    if (!isValidDate(dateLeft) || !isValidDate(dateRight)) {
      return false;
    }

    const normalizeDate = (date) => {
      return set(date, {
        date: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }).getTime();
    };

    return normalizeDate(dateLeft) === normalizeDate(dateRight);
  };

  const handlerChangePreviewInterval = (dayDate) => {
    onChange(
      isValidDate(interval.start) && isValidDate(interval.end)
        ? { start: dayDate, end: null }
        : { start: interval.start, end: dayDate }
    );
  };

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <button
          type="button"
          onClick={handlerPrevMonth}
          className={s.navButton}
        >
          <Svg id="calendar-arrow-left" />
        </button>
        <span>{format(calendarMonth, 'MMMM yyyy')}</span>
        <button
          type="button"
          onClick={handlerNextMonth}
          className={cn(s.navButton, {
            [s.disabled]: isSameMonth(calendarMonth, new Date()),
          })}
          disabled={isSameMonth(calendarMonth, new Date())}
        >
          <Svg id="calendar-arrow-right" />
        </button>
      </div>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((weekDay, idx) => (
        <span key={idx} className={s.weekday}>
          {weekDay}
        </span>
      ))}
      <div onMouseLeave={() => onChangeHoverDate(null)}>
        {calendarMonthDays.map((day) => {
          if (!day) return null;
          const { date: dayDate, dayNumber, monthType } = day;
          const isDisabled = dayDate.getTime() > MAX_DATEPICKER_DATE.getTime();

          return (
            <button
              key={dayDate.getTime()}
              type="button"
              className={cn(s.day, {
                [s.prev]: monthType === MONTH.PREV,
                [s.next]: monthType === MONTH.NEXT,
                [s.inRange]:
                  isValidDate(interval.start) &&
                  isValidDate(interval.end) &&
                  isDayInRange(dayDate),
                [s.rangeStart]:
                  isValidDate(interval.start) &&
                  isSameDay(dayDate, interval.start),
                [s.rangeEnd]:
                  isValidDate(interval.end) && isSameDay(dayDate, interval.end),
                [s.disabled]: isDisabled,
                [s.today]: isSameDay(dayDate, new Date()),
                [s.hover]:
                  isValidDate(hoverDate) && isSameDay(dayDate, hoverDate),
                [s.inPreviewRange]: isDayInPreviewRange(dayDate),
                [s.previewRangeStart]:
                  !isValidDate(interval.end) &&
                  isSameDay(interval.start, dayDate),
                [s.previewRangeEnd]:
                  !isValidDate(interval.end) &&
                  isValidDate(hoverDate) &&
                  isSameDay(hoverDate, dayDate),
              })}
              onClick={() => {
                if (!isDisabled) {
                  handlerChangePreviewInterval(dayDate);
                }
              }}
              onMouseOver={() => {
                onChangeHoverDate(dayDate);
              }}
              onFocus={() => {
                onChangeHoverDate(dayDate);
              }}
              tabIndex={isDisabled ? -1 : 0}
            >
              <span className={s.dayNumber}>
                <span>{dayNumber}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
