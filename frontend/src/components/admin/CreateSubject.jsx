import axios from "axios";
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Calendar,
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  Lightbulb,
  Target,
  Zap,
  Hash,
  MapPin,
  Clock,
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Howl } from "howler";
import Navbar from "../shared/Navbar";

const ValidatedInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  icon: Icon,
  label,
  required = false
}) => {
  const isValid = value && value.toString().trim();
  
  return (
    <div className="relative group">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-gray-800 font-medium
            ${isValid 
              ? "border-green-400 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100" 
              : "border-gray-200 bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            }
            focus:outline-none shadow-sm hover:shadow-md
            ${className}
          `}
        />
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
    </div>
  );
};

const EnhancedDropdown = ({ value, onValueChange, options, placeholder, icon: Icon, label }) => {
  const isValid = value && value.toString().trim();

  return (
    <div className="relative group">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
          {label}
          <span className="text-red-500">*</span>
        </label>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`
              w-full justify-between px-4 py-3 h-auto rounded-2xl border-2 transition-all duration-300 font-medium
              ${isValid 
                ? "border-green-400 bg-green-50 hover:bg-green-50 text-gray-800" 
                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              }
              focus:ring-4 focus:ring-emerald-100 shadow-sm hover:shadow-md
            `}
          >
            <span className={isValid ? "text-gray-800" : "text-gray-500"}>
              {value || placeholder}
            </span>
            <div className="flex items-center gap-2">
              {isValid && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DropdownMenuLabel className="text-emerald-700 font-semibold">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl mx-1 transition-all duration-200"
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const CreateSubject = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ startTime: "", endTime: "" }]);
  const navigate = useNavigate();

  const departmentOptions = [
    { value: "EE", label: "Electrical Engineering (EE)" },
    { value: "ECE", label: "Electronics & Communication (ECE)" },
    { value: "CSE", label: "Computer Science (CSE)" },
    { value: "IT", label: "Information Technology (IT)" }
  ];

  const semesterOptions = [
    { value: "first", label: "First Semester" },
    { value: "second", label: "Second Semester" },
    { value: "third", label: "Third Semester" },
    { value: "fourth", label: "Fourth Semester" },
    { value: "fifth", label: "Fifth Semester" },
    { value: "sixth", label: "Sixth Semester" },
    { value: "seventh", label: "Seventh Semester" },
    { value: "eighth", label: "Eighth Semester" }
  ];

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: "", endTime: "" }]);
  };

  const removeTimeSlot = (index) => {
    const newTimeSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newTimeSlots);
  };

  const updateTimeSlot = (index, field, value) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index][field] = value;
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/subject/creatsubject",
        {
          department,
          semester,
          subjectName,
          subjectCode,
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          },
          timeSlots: timeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubjectName("");
      setSubjectCode("");
      setSemester("");
      setDepartment("");
      setLatitude("");
      setLongitude("");
      setTimeSlots([{ startTime: "", endTime: "" }]);
      toast.success(res.data.message);
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();

      navigate("/Admin/subject");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCompletionPercentage = () => {
    const basicFields = [subjectName, subjectCode, department, semester].filter(Boolean).length;
    const locationFields = [latitude, longitude].filter(Boolean).length;
    const timeSlotsFilled = timeSlots.filter(slot => slot.startTime && slot.endTime).length;
    const totalFields = 4 + 2 + (timeSlots.length > 0 ? 1 : 0);
    const filledFields = basicFields + locationFields + (timeSlotsFilled > 0 ? 1 : 0);
    return Math.round((filledFields / totalFields) * 100);
  };

  const isFormValid = subjectName && subjectCode && department && semester && latitude && longitude && timeSlots.every(slot => slot.startTime && slot.endTime);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <motion.div
              onClick={() => navigate("/Admin/subject")}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 cursor-pointer transition-all duration-300 p-3 rounded-xl hover:bg-white/70 hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Subjects</span>
            </motion.div>
          </div>

          {/* Creative Header for Subject Creation */}
          <div className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Subject Builder
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Create and organize academic subjects
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto border border-white/50 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-700">Setup Progress</span>
                  <Badge className="bg-emerald-100 text-emerald-700">{getCompletionPercentage()}%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-15 blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-full opacity-10 blur-lg"></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-3 right-3 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/30 rounded-2xl rotate-45 animate-pulse"></div>
                </div>
                <div className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Lightbulb className="w-6 h-6" />
                    Subject Details
                    <Sparkles className="w-5 h-5" />
                  </CardTitle>
                  <p className="text-white/90 mt-2">Fill in the information to create a new subject</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Subject Name and Code Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ValidatedInput
                      label="Subject Name"
                      icon={BookOpen}
                      placeholder="Enter the subject name..."
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                    />

                    <ValidatedInput
                      label="Subject Code"
                      icon={Hash}
                      placeholder="Enter the subject code..."
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      required
                    />
                  </div>

                  {/* Department and Semester Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EnhancedDropdown
                      label="Department"
                      icon={Building2}
                      placeholder="Select Department"
                      value={department}
                      onValueChange={setDepartment}
                      options={departmentOptions}
                    />

                    <EnhancedDropdown
                      label="Semester"
                      icon={Calendar}
                      placeholder="Select Semester"
                      value={semester}
                      onValueChange={setSemester}
                      options={semesterOptions}
                    />
                  </div>

                  {/* Location Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-l-4 border-blue-400">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Location Coordinates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ValidatedInput
                        label="Latitude"
                        icon={MapPin}
                        type="number"
                        step="any"
                        placeholder="e.g., 22.611522"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />

                      <ValidatedInput
                        label="Longitude"
                        icon={MapPin}
                        type="number"
                        step="any"
                        placeholder="e.g., 88.420322"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-l-4 border-purple-400">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Time Slots
                      </h3>
                      <Button
                        type="button"
                        onClick={addTimeSlot}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Slot
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-end gap-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <ValidatedInput
                              label={`Start Time ${index + 1}`}
                              icon={Clock}
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                              required
                            />
                            <ValidatedInput
                              label={`End Time ${index + 1}`}
                              icon={Clock}
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                              required
                            />
                          </div>
                          {timeSlots.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 rounded-xl px-3 py-3 mb-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-emerald-400">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-600" />
                      Subject Preview
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Name:</span> {subjectName || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Code:</span> {subjectCode || "Not specified"}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Department:</span> {
                          departmentOptions.find(opt => opt.value === department)?.label || "Not selected"
                        }
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Semester:</span> {
                          semesterOptions.find(opt => opt.value === semester)?.label || "Not selected"
                        }
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Location:</span> {
                          latitude && longitude ? `${latitude}, ${longitude}` : "Not specified"
                        }
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Time Slots:</span> {
                          timeSlots.filter(slot => slot.startTime && slot.endTime).length || "None"
                        } slot(s)
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    className="text-center pt-4"
                    whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                    whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                  >
                    <Button
                      type="submit"
                      disabled={!isFormValid}
                      className={`
                        w-full font-bold py-4 px-8 rounded-2xl text-lg shadow-2xl transition-all duration-500
                        ${isFormValid
                          ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white hover:shadow-3xl"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                        }
                      `}
                    >
                      {isFormValid ? (
                        <>
                          <Zap className="w-6 h-6 mr-2" />
                          Create Subject
                          <Sparkles className="w-5 h-5 ml-2" />
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-6 h-6 mr-2" />
                          Complete All Fields
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Info Section */}
        <motion.div
          className="relative max-w-4xl mx-auto px-6 text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 shadow-xl">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">4</p>
                  <p className="text-sm text-gray-600">Departments</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">8</p>
                  <p className="text-sm text-gray-600">Semesters</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-800">Unlimited</p>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CreateSubject;