import FullCalendar from "@fullcalendar/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayGridPlugin from "@fullcalendar/daygrid";
import idLocale from "@fullcalendar/core/locales/id";

const CustCalendar = () => {
  const calendarRef = useRef<FullCalendar | null>(null);

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    calendarApi.today();
    updateCurrentDate();
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    calendarApi.prev();
    updateCurrentDate();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    calendarApi.next();
    updateCurrentDate();
  };

  const updateCurrentDate = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    setCurrentDate(calendarApi.getDate());
  };

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCurrentDate(calendarApi.getDate());
    }
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-700 mb-1">
          {currentDate.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <div className="flex gap-1 mb-3">
          <Button size="sm" variant="outline" onClick={handleToday}>
            Hari Ini
          </Button>
          <Button size="sm" variant="outline" onClick={handlePrev}>
            <ChevronLeft />
          </Button>
          <Button size="sm" variant="outline" onClick={handleNext}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <FullCalendar
        locale={idLocale}
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={[
          { title: "Event 1", date: "2025-05-24" },
          { title: "Event 2", date: "2025-05-20" },
        ]}
        headerToolbar={false}
        height="auto"
        contentHeight={500}
      />
    </>
  );
};

export default CustCalendar;
