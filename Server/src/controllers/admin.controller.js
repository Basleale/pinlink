import Availability from "../models/Availability"
import Appointment from "../models/Appointment"


export const getDoctorAvaliablity = async (req,res) => {
    try{
        const { doctorId } = req.params;

                //GET /availability/:doctorId?start=2026-06-01&end=2026-06-30 for a more scalable approach
        const { startDateQuery, endDateQuery } = req.query;

        const availibility = await Availability.findOne({ doctor: doctorId});

        if(!availibility){
            return res.status(404).json({
                success: false,
                message: "Doctor availibility not found"
            })
        }


        const appointments = await Appointment.findOne({
            doctor: doctorId,
            status: { $in: ["Pending", "Confirmed", "Rescheduled"]}
        });

        //hold final availability/schedule
        const results = [];


        const startDate = new Date(startDateQuery);
        const endDate = new Date(endDateQuery);

        for(
            let curr = new Date(startDate);
            curr <= endDate;
            curr.setDate(curr.getDate() + 1)
        ){
            const currentDate = new Date(curr);

            //check blackout array if currentDate is a blackout Date
            const isBlackout = availibility.blackoutDates.some(
                blackout => blackout.toDateString() === currentDate.toDateString()
            );

            if (isBlackout) continue;


            //check day availability
            const dayName = dayMap[currentDate.getDay()];
            const schedule = availibility.weeklySchedule[dayName];

            if(!schedule?.isAvailable) continue;


            //check and map slots for a day
            const slots = [];
            const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
            const [endHour, endMinute] = schedule.endTime.split(":").mpa(Number);

            const slotStart = new Date(currentDate);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEndLimit = new Date(currentDate);
            slotEndLimit.setHours(endHour, endMinute, 0, 0);


            const SLOT_DURATION = 30;
            //check available slots for that day
            while(slotStart < slotEndLimit){
                //set slot end
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes( slotEnd.getMinutes() + SLOT_DURATION);

                //check overlapping slots
                const isBooked = appointments.some(
                    appointment => slotStart < appointment.endTime && slotEnd > appointment.startTime
                )

                //add avaliable slots
                if(!isBooked){
                    slots.push(slotStart.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false}));
                }

                slotStart.setMinutes(slotStart.getMinutes() + SLOT_DURATION);
            }

            //save date and slot
            results.push({
                date: currentDate.toISOString().split("T")[0],
                slots
            });
        }

        return res.status(200).json({
            success: true,
            doctorId,
            availibility: result
        });
    }catch(error){
        console.error("Error getting doctor availability", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get a doctor availability",
            error: error.message
        });
    }
}

