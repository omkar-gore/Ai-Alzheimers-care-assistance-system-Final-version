import Medicine from '../models/Medicine.js';
import Schedule from '../models/Schedule.js';
import Task from '../models/Task.js';
import Appointment from '../models/Appointment.js';
import MedicalReport from '../models/MedicalReport.js';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import {
  getAuthorizedPatientIds,
  isAuthorizedForPatient,
} from '../utils/authCheck.js';

// ==========================================
// ROLE-AWARE CONTEXT BUILDER
// ==========================================
const buildUserContext = async (user, requestedPatientId) => {
  let context = {
    role: user.role,
    userName: user.name,
    patientName: '',
    medicines: [],
    schedules: [],
    tasks: [],
    appointments: [],
    reportsCount: 0,
    assignedPatients: [],
  };

  try {
    if (user.role === 'patient') {
      context.patientName = user.name;
      const [meds, scheds, tsks, appts] = await Promise.all([
        Medicine.find({ patient: user._id }).sort({ time: 1 }),
        Schedule.find({ patient: user._id }).sort({ time: 1 }),
        Task.find({ patient: user._id }).sort({ createdAt: 1 }),
        Appointment.find({ patient: user._id }).sort({ date: 1, time: 1 }),
      ]);
      context.medicines = meds;
      context.schedules = scheds;
      context.tasks = tsks;
      context.appointments = appts;
    } else if (user.role === 'caregiver') {
      const authorizedIds = await getAuthorizedPatientIds(user);
      let targetId = null;

      if (requestedPatientId && authorizedIds.some((id) => id.toString() === requestedPatientId.toString())) {
        targetId = requestedPatientId;
      } else if (authorizedIds.length > 0) {
        targetId = authorizedIds[0];
      }

      if (targetId) {
        const patientUser = await User.findById(targetId);
        if (patientUser) context.patientName = patientUser.name;

        const [meds, scheds, tsks, appts, reps] = await Promise.all([
          Medicine.find({ patient: targetId }).sort({ time: 1 }),
          Schedule.find({ patient: targetId }).sort({ time: 1 }),
          Task.find({ patient: targetId }).sort({ createdAt: 1 }),
          Appointment.find({ patient: targetId }).sort({ date: 1, time: 1 }),
          MedicalReport.countDocuments({ patient: targetId }),
        ]);
        context.medicines = meds;
        context.schedules = scheds;
        context.tasks = tsks;
        context.appointments = appts;
        context.reportsCount = reps;
      }
    } else if (user.role === 'doctor') {
      const authorizedIds = await getAuthorizedPatientIds(user);
      const patientUsers = await User.find({ _id: { $in: authorizedIds } }).select('name email phone age gender');
      context.assignedPatients = patientUsers;

      let targetId = null;
      if (requestedPatientId && authorizedIds.some((id) => id.toString() === requestedPatientId.toString())) {
        targetId = requestedPatientId;
      }

      if (targetId) {
        const patientUser = patientUsers.find((p) => p._id.toString() === targetId.toString());
        if (patientUser) context.patientName = patientUser.name;

        const [meds, scheds, tsks, appts, reps] = await Promise.all([
          Medicine.find({ patient: targetId }).sort({ time: 1 }),
          Schedule.find({ patient: targetId }).sort({ time: 1 }),
          Task.find({ patient: targetId }).sort({ createdAt: 1 }),
          Appointment.find({ patient: targetId }).sort({ date: 1, time: 1 }),
          MedicalReport.countDocuments({ patient: targetId }),
        ]);
        context.medicines = meds;
        context.schedules = scheds;
        context.tasks = tsks;
        context.appointments = appts;
        context.reportsCount = reps;
      }
    }
  } catch (err) {
    console.warn('Could not fully build AI context:', err.message);
  }

  return context;
};

// ==========================================
// DYNAMIC INTELLIGENT FALLBACK ASSISTANT
// ==========================================
const generateContextualResponse = (question, context) => {
  const q = question.toLowerCase();
  const { role, userName, patientName, medicines, schedules, tasks, appointments } = context;

  // ------------------------------------------
  // PATIENT ASSISTANT
  // ------------------------------------------
  if (role === 'patient') {
    if (q.includes('medicine') || q.includes('pill') || q.includes('tablet') || q.includes('dose')) {
      if (!medicines || medicines.length === 0) {
        return `Hello ${userName}! You currently have no medicines scheduled for today. If you need any assistance, please check with your caregiver.`;
      }
      const medList = medicines
        .map((m, i) => `${i + 1}. **${m.name}** (${m.dosage}) at **${m.time}** - ${m.status === 'done' ? '✅ Taken' : '⏳ Pending'}`)
        .join('\n');
      return `Hello ${userName}! Here is your medicine schedule for today:\n\n${medList}\n\nRemember to take them with a glass of water, and ask your caregiver if you have questions!`;
    }

    if (q.includes('routine') || q.includes('schedule') || q.includes('today') || q.includes('plan')) {
      if (!schedules || schedules.length === 0) {
        return `Good day, ${userName}! Your daily routine is light today with no scheduled activities. Take time to relax and rest well.`;
      }
      const schedList = schedules
        .map((s, i) => `• **${s.time}**: ${s.activity} ${s.notes ? `(${s.notes})` : ''}`)
        .join('\n');
      return `Here is your schedule for today, ${userName}:\n\n${schedList}\n\nTake it one step at a time!`;
    }

    if (q.includes('task') || q.includes('to do') || q.includes('done')) {
      if (!tasks || tasks.length === 0) {
        return `You have no tasks pending today, ${userName}. Great job keeping your routine calm!`;
      }
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const taskList = tasks
        .map((t) => `- [${t.status === 'completed' ? 'x' : ' '}] ${t.title} ${t.status === 'completed' ? '✅' : '⏳'}`)
        .join('\n');
      return `You have completed ${completed} out of ${tasks.length} tasks today:\n\n${taskList}\n\nYou're doing wonderfully!`;
    }

    if (q.includes('appointment') || q.includes('doctor') || q.includes('visit')) {
      if (!appointments || appointments.length === 0) {
        return `You don't have any doctor appointments scheduled right now, ${userName}.`;
      }
      const apptList = appointments
        .map((a) => `• **${a.title}** on **${a.date}** at **${a.time}** (${a.location || 'Clinic'})`)
        .join('\n');
      return `Here are your upcoming appointments:\n\n${apptList}\n\nYour caregiver will help you get there safely.`;
    }

    if (q.includes('memory') || q.includes('remember') || q.includes('who') || q.includes('photo')) {
      return `If you ever want to remember loved ones or special memories, please visit your **Memory Book** in the CareMate menu. It has photos and notes of family and friends to help you!`;
    }

    if (q.includes('game') || q.includes('exercise') || q.includes('activity')) {
      return `Doing gentle activities helps your mind and body! Try visiting the **Mind Games** or **Exercise** section in your menu for gentle stretches and fun memory puzzles.`;
    }

    return `Hello ${userName}! I am CareMate, your care assistant. I can help remind you of your medicines, daily routine, tasks, or upcoming appointments. How can I help you feel comfortable today?`;
  }

  // ------------------------------------------
  // CAREGIVER ASSISTANT
  // ------------------------------------------
  if (role === 'caregiver') {
    const pName = patientName || 'your patient';

    if (q.includes('medicine') || q.includes('medication') || q.includes('dose') || q.includes('pill')) {
      if (!medicines || medicines.length === 0) {
        return `Currently, there are no active medications scheduled for ${pName}. You can add prescriptions under the Schedule & Medicines tab.`;
      }
      const pendingMeds = medicines.filter((m) => m.status === 'pending');
      return `Medication overview for **${pName}**:\n\n• Total Medications: ${medicines.length}\n• Pending Doses: ${pendingMeds.length}\n\n${medicines.map((m) => `• **${m.name}** (${m.dosage}) - ${m.time} [${m.status === 'done' ? 'Taken' : 'Pending'}]`).join('\n')}\n\nTip: Consistent timing helps maintain optimal therapeutic levels and reduces anxiety in Alzheimer's patients.`;
    }

    if (q.includes('schedule') || q.includes('routine') || q.includes('activity')) {
      if (!schedules || schedules.length === 0) {
        return `No daily schedule items are set for ${pName}. Setting predictable daily times for meals, rest, and light activities provides comforting structure for Alzheimer's patients.`;
      }
      return `Daily Routine for **${pName}**:\n\n${schedules.map((s) => `• **${s.time}**: ${s.activity}`).join('\n')}\n\nAlzheimer's Care Tip: Keep routines predictable to minimize confusion and sundowning symptoms.`;
    }

    if (q.includes('task') || q.includes('progress') || q.includes('adherence')) {
      const completed = tasks ? tasks.filter((t) => t.status === 'completed').length : 0;
      const total = tasks ? tasks.length : 0;
      return `Task progress for **${pName}**:\n\n• Completed: ${completed} of ${total} (${total ? Math.round((completed / total) * 100) : 0}%)\n\nBreak larger tasks into single, bite-sized steps with gentle verbal encouragement to prevent frustration.`;
    }

    if (q.includes('appointment') || q.includes('doctor')) {
      if (!appointments || appointments.length === 0) {
        return `There are no upcoming medical appointments scheduled for ${pName}. You can schedule one in the Appointments module.`;
      }
      return `Upcoming Appointments for **${pName}**:\n\n${appointments.map((a) => `• **${a.title}** on ${a.date} at ${a.time} - Location: ${a.location || 'Clinic'}`).join('\n')}\n\nPreparation tip: Note down any recent behavioral changes or sleep disruptions before the visit.`;
    }

    if (q.includes('sundown') || q.includes('agitat') || q.includes('behav') || q.includes('sleep')) {
      return `Caregiving guidance for managing agitation or sundowning in Alzheimer's:\n\n1. **Maintain gentle lighting**: Keep rooms well-lit in the late afternoon to reduce shadows.\n2. **Calm environment**: Minimize loud television noise or sudden changes during evening hours.\n3. **Comfort routine**: A warm caffeine-free herbal tea or soothing familiar music can promote relaxation.\n4. **Reassurance**: Avoid arguing or over-correcting; validate their feelings calmly.`;
    }

    return `Hello ${userName}! As the caregiver assistant, I'm here to support you in managing ${pName}'s care plan, medications, daily activities, and appointment preparation. What would you like to review?`;
  }

  // ------------------------------------------
  // DOCTOR ASSISTANT
  // ------------------------------------------
  if (role === 'doctor') {
    const pName = patientName || 'the selected patient';

    if (q.includes('patient') || q.includes('assigned') || q.includes('list')) {
      if (context.assignedPatients && context.assignedPatients.length > 0) {
        const pList = context.assignedPatients.map((p) => `• **${p.name}** (Age ${p.age}, ${p.gender}) - Phone: ${p.phone}`).join('\n');
        return `Dr. ${userName}, you have **${context.assignedPatients.length} assigned patient(s)**:\n\n${pList}\n\nSelect any patient in your dashboard to view their complete clinical profile and history.`;
      }
      return `Dr. ${userName}, you currently have no assigned patients in this view. You can link patients via the "Assign Patient" button using their registered email or ID.`;
    }

    if (patientName && (q.includes('medication') || q.includes('medicine') || q.includes('drug'))) {
      if (!medicines || medicines.length === 0) {
        return `Dr. ${userName}, no active medications are currently recorded for **${pName}**.`;
      }
      return `Medication Regimen for **${pName}**:\n\n${medicines.map((m) => `• **${m.name}** | Dosage: ${m.dosage} | Time: ${m.time} | Instructions: ${m.instructions || 'Standard'} | Status: ${m.status}`).join('\n')}\n\nClinical reminder: Monitor for common cholinesterase inhibitor side effects (GI distress, bradycardia).`;
    }

    if (patientName && (q.includes('summary') || q.includes('overview') || q.includes('report') || q.includes('status'))) {
      const completed = tasks ? tasks.filter((t) => t.status === 'completed').length : 0;
      return `Clinical Summary for **${pName}**:\n\n• Active Medications: ${medicines ? medicines.length : 0}\n• Daily Tasks Adherence: ${tasks && tasks.length ? `${completed}/${tasks.length} (${Math.round((completed / tasks.length) * 100)}%)` : 'N/A'}\n• Recorded Medical Reports: ${context.reportsCount || 0}\n• Scheduled Appointments: ${appointments ? appointments.length : 0}\n\nPatient is actively monitored through the CareMate platform.`;
    }

    return `Good day Dr. ${userName}. I am your Clinical Assistant on CareMate. I can provide structured patient overviews, medication reviews, appointment timelines, and clinical workflow assistance for your assigned patients.`;
  }

  return `Hello ${userName}! How can I assist you with your CareMate experience today?`;
};

// ==========================================
// AI CHAT HANDLER
// ==========================================
export const aiChat = async (req, res) => {
  try {
    const question = req.body.question || req.body.message;
    const requestedPatientId = req.body.patientId || null;

    if (!question || question.trim() === '') {
      return res.status(400).json({ answer: 'Please enter a question or message.' });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ answer: 'Authentication required.' });
    }

    // Build authorized context
    const context = await buildUserContext(user, requestedPatientId);

    // If GEMINI_API_KEY is available, call Google Gemini API
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const apiKey = process.env.GEMINI_API_KEY.trim();
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let systemInstruction = '';
        if (user.role === 'patient') {
          systemInstruction = `You are CareMate Assistant, a gentle, compassionate, and reassuring AI companion for an Alzheimer's patient named ${user.name}. Use warm, simple, short, and clear language. Remind them gently about their day. NEVER pretend to diagnose medical illnesses. Direct medical concerns to their caregiver or doctor. Context: Medicines: ${JSON.stringify(context.medicines.map((m) => `${m.name} (${m.dosage}) at ${m.time}`))}, Daily Routine: ${JSON.stringify(context.schedules.map((s) => `${s.time}: ${s.activity}`))}.`;
        } else if (user.role === 'caregiver') {
          systemInstruction = `You are CareMate Caregiver Advisor, assisting caregiver ${user.name} who cares for ${context.patientName || 'an Alzheimer patient'}. Provide compassionate, structured, practical caregiving guidance, routine tips, and medication organization assistance. Context: Patient: ${context.patientName}, Medicines: ${JSON.stringify(context.medicines)}, Tasks: ${JSON.stringify(context.tasks)}.`;
        } else {
          systemInstruction = `You are CareMate Clinical Assistant, assisting Dr. ${user.name}. Provide concise, clinical, structured summaries, medication checks, and care plan overviews based on authorized patient data. Patient: ${context.patientName}, Medicines: ${JSON.stringify(context.medicines)}, Appointments: ${JSON.stringify(context.appointments)}.`;
        }

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${question}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        };

        const response = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return res.json({ answer: candidateText.trim() });
          }
        } else {
          console.warn('Gemini API call returned non-200:', response.status);
        }
      } catch (geminiError) {
        console.warn('Gemini API fetch error, falling back to local engine:', geminiError.message);
      }
    }

    // Contextual fallback response
    const answer = generateContextualResponse(question, context);
    return res.json({ answer });
  } catch (error) {
    console.error('aiChat error:', error);
    return res.status(500).json({
      answer: 'Sorry, I encountered an issue processing your request. Please try again.',
    });
  }
};

export default { aiChat };
