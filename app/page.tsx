"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Input, Label, HelperText, FormGroup } from "@/components/ui/input";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress, Spinner, Skeleton } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { PatientRow } from "@/components/ui/patient-row";
import { DiagnosisCard } from "@/components/ui/diagnosis-card";
import { AIChat } from "@/components/ui/ai-chat";
import { Stepper } from "@/components/ui/stepper";
import {
  Activity,
  Users,
  Calendar,
  Settings,
  Heart,
  ClipboardList,
  Search,
  Bell,
  TrendingUp,
  Pill,
  Brain,
  ChevronRight,
  Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Today", href: "#today", icon: <Heart size={16} /> },
  { label: "Visits", href: "#visits", icon: <Calendar size={16} /> },
  { label: "Patients", href: "#patients", icon: <Users size={16} /> },
  { label: "Settings", href: "#settings", icon: <Settings size={16} /> },
];

const PATIENTS = [
  { id: 1, name: "Floyd Miles", time: "8:40 AM", status: "On the mend", avatar: "https://i.pravatar.cc/150?img=59" },
  { id: 2, name: "Ralph Edwards", time: "9:15 AM", status: "Critical", statusVariant: "error" as const, avatar: "https://i.pravatar.cc/150?img=33" },
  { id: 3, name: "Theresa Webb", time: "10:30 AM", status: "Stable", statusVariant: "success" as const, avatar: "https://i.pravatar.cc/150?img=44" },
  { id: 4, name: "Brooklyn Simmons", time: "11:00 AM", avatar: "https://i.pravatar.cc/150?img=12" },
];

const AI_MESSAGES = [
  {
    id: "1",
    role: "ai" as const,
    content: "Dr. Brain, I've analyzed Ralph's latest PHQ-9 results. There is a slight improvement. Should I draft a medication adjustment?",
  },
  {
    id: "2",
    role: "user" as const,
    content: "Yes, suggest a lower dosage for Ketorolac.",
  },
];

const STEPPER_STEPS = [
  { label: "Intake", status: "completed" as const },
  { label: "Diagnosis", status: "active" as const },
  { label: "Prescription", status: "pending" as const },
];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-body)" }}>
      {/* Sidebar */}
      <nav
        className="w-[260px] fixed h-screen overflow-y-auto flex flex-col gap-4 z-40 border-r border-[var(--secondary-200)]"
        style={{ background: "var(--bg-surface)", padding: "var(--space-6)" }}
      >
        <div className="flex items-center gap-2 text-xl font-bold mb-4 text-[var(--primary-600)]">
          <Activity size={22} strokeWidth={2} />
          MedicalSystem
        </div>

        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] font-medium text-sm transition-all duration-200 text-[var(--secondary-600)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)]"
            >
              <span className="text-current">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-[var(--secondary-200)]">
          <div className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--secondary-50)]">
            <Avatar src="https://i.pravatar.cc/150?img=11" alt="Dr. Brain" size="sm" />
            <div>
              <div className="text-sm font-semibold text-[var(--secondary-900)]">Dr. Brain</div>
              <div className="text-xs text-[var(--secondary-500)]">Neurologist</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "260px", padding: "var(--space-8)", maxWidth: "calc(1200px + 260px)" }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--secondary-900)]">
              Good morning, Dr. Brain!
            </h1>
            <p className="text-sm text-[var(--secondary-500)] mt-1">
              You have {PATIENTS.length} following visits today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--secondary-500)] hover:bg-[var(--secondary-100)] transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--secondary-500)] hover:bg-[var(--secondary-100)] transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full" />
            </button>
            <Button variant="primary" size="sm">
              <Plus size={14} />
              Add new visit
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            value="4"
            label="Visits Today"
            trend={{ value: "12% vs last week", positive: true }}
            icon={<Calendar size={18} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value="18"
            label="Total Patients"
            trend={{ value: "5% vs last month", positive: true }}
            icon={<Users size={18} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value="3"
            label="Prescriptions"
            icon={<Pill size={18} style={{ color: "var(--primary-600)" }} />}
          />
          <StatCard
            value="92%"
            label="Medication Adherence"
            trend={{ value: "8% vs last week", positive: true }}
            icon={<TrendingUp size={18} style={{ color: "var(--primary-600)" }} />}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Patient List */}
          <div className="col-span-2">
            {/* Today's Visits */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today&apos;s Visits</CardTitle>
                  <button className="text-sm text-[var(--primary-600)] font-medium hover:underline flex items-center gap-1">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {PATIENTS.map((p) => (
                  <PatientRow
                    key={p.id}
                    name={p.name}
                    time={p.time}
                    avatarSrc={p.avatar}
                    status={p.status}
                    statusVariant={p.statusVariant}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Patient Detail Card with Tabs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src="https://i.pravatar.cc/150?img=59" alt="Floyd Miles" size="md" />
                    <div>
                      <CardTitle>Floyd Miles</CardTitle>
                      <p className="text-sm text-[var(--secondary-500)]">Male, 34 · Patient since 2021</p>
                    </div>
                  </div>
                  <StatusPill>On the mend</StatusPill>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="treatment">Treatment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <DiagnosisCard
                      title="Depression - PHQ-9"
                      description="Depending on the intensity of the symptoms and the associated limitations, a distinction is made between mild, moderate and severe depression."
                      status="On the mend"
                      date="02 March 2023"
                    />

                    <div className="mt-4">
                      <Progress value={62} label="Medication complete" />
                    </div>

                    <div className="mt-4">
                      <Stepper steps={STEPPER_STEPS} />
                    </div>
                  </TabsContent>

                  <TabsContent value="history">
                    <div className="text-sm text-[var(--secondary-600)] mt-2">
                      Patient has a history of mild hypertension and depressive episodes. First recorded visit: January 2021.
                    </div>
                  </TabsContent>

                  <TabsContent value="treatment">
                    <table className="w-full text-left border-collapse mt-2">
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--secondary-200)" }}>
                          <th className="py-3 px-3 text-xs text-[var(--secondary-500)] uppercase tracking-wide">Medicine</th>
                          <th className="py-3 px-3 text-xs text-[var(--secondary-500)] uppercase tracking-wide">Dosage</th>
                          <th className="py-3 px-3 text-xs text-[var(--secondary-500)] uppercase tracking-wide">Status</th>
                          <th className="py-3 px-3" />
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid var(--secondary-100)" }}>
                          <td className="py-3 px-3 font-medium text-sm">Azelastine</td>
                          <td className="py-3 px-3 text-sm text-[var(--secondary-600)]">20mg</td>
                          <td className="py-3 px-3"><Badge variant="success">Active</Badge></td>
                          <td className="py-3 px-3 text-right text-[var(--secondary-400)] cursor-pointer">⋮</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-medium text-sm">Ketorolac</td>
                          <td className="py-3 px-3 text-sm text-[var(--secondary-600)]">10mg</td>
                          <td className="py-3 px-3"><Badge variant="error">Stopped</Badge></td>
                          <td className="py-3 px-3 text-right text-[var(--secondary-400)] cursor-pointer">⋮</td>
                        </tr>
                      </tbody>
                    </table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-1 flex flex-col gap-6">
            {/* AI Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain size={18} style={{ color: "var(--primary-600)" }} />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AIChat
                  messages={AI_MESSAGES}
                  suggestion={{
                    content: "Reduce Ketorolac to 5mg daily. Monitor for next 7 days.",
                  }}
                  userAvatarSrc="https://i.pravatar.cc/150?img=11"
                />
              </CardContent>
            </Card>

            {/* Quick Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Note</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <FormGroup>
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Input id="patient-name" placeholder="Ralph Edwards" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="note-email">Email</Label>
                  <Input
                    id="note-email"
                    type="email"
                    placeholder="ralph@example.com"
                    error
                    defaultValue="ralph@examp"
                  />
                  <HelperText error>⚠ Invalid email address</HelperText>
                </FormGroup>
                <FormGroup className="mb-0">
                  <Label htmlFor="note-search">Search</Label>
                  <Input
                    id="note-search"
                    placeholder="Search records..."
                    leftIcon={<Search size={16} />}
                  />
                </FormGroup>
                <Button variant="primary" size="md" className="w-full mt-4">
                  Save Note
                </Button>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Care Team</CardTitle>
                  <AvatarGroup max={3}>
                    <Avatar src="https://i.pravatar.cc/150?img=33" alt="Team 1" size="sm" />
                    <Avatar src="https://i.pravatar.cc/150?img=34" alt="Team 2" size="sm" />
                    <Avatar src="https://i.pravatar.cc/150?img=35" alt="Team 3" size="sm" />
                    <Avatar src="https://i.pravatar.cc/150?img=36" alt="Team 4" size="sm" />
                    <Avatar src="https://i.pravatar.cc/150?img=37" alt="Team 5" size="sm" />
                  </AvatarGroup>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2">
                  {["Dr. Ellis", "Dr. Park", "Nurse Carol"].map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: i === 0 ? "var(--success)" : i === 1 ? "var(--warning)" : "var(--secondary-400)",
                        }}
                      />
                      <span className="text-sm text-[var(--secondary-700)]">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Design System Reference Row */}
        <div className="mt-8 pt-8 border-t border-[var(--secondary-200)]">
          <h2 className="text-lg font-bold text-[var(--secondary-700)] mb-4 uppercase tracking-wide text-xs">
            Design System Components
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[var(--secondary-500)] uppercase tracking-wide">Buttons</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[var(--secondary-500)] uppercase tracking-wide">Badges & Pills</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-wrap gap-3 items-center">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <StatusPill>On the mend</StatusPill>
                <StatusPill variant="success">Recovered</StatusPill>
                <StatusPill variant="error">Critical</StatusPill>
              </CardContent>
            </Card>

            {/* Progress & Loaders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[var(--secondary-500)] uppercase tracking-wide">Progress & Loaders</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-4">
                <Progress value={62} label="Medication complete" />
                <Progress value={30} />
                <Progress value={85} />
                <div className="flex items-center gap-4 mt-2">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stepper */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-[var(--secondary-500)] uppercase tracking-wide">Stepper</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Stepper steps={STEPPER_STEPS} />
                <Stepper
                  className="mt-6"
                  steps={[
                    { label: "Intake", status: "completed" },
                    { label: "Diagnosis", status: "completed" },
                    { label: "Prescription", status: "active" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
