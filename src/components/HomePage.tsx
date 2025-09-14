import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TravelTableView } from "./TravelTableView";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp, 
  Plane, 
  Building2,
  Table,
  CalendarDays,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Traveler {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  currentTrips: number;
  totalTrips: number;
}

interface TravelBatch {
  id: string;
  name: string;
  destination: string;
  travelers: Traveler[];
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'confirmed' | 'in-progress' | 'completed';
  budget: number;
}

// Interface compatible avec TravelRequest pour le tableau
interface TravelRequestFromBatch {
  id: string;
  purpose: 'salon' | 'visite-client' | 'autres';
  location: { quartier: string; ville: string; pays: string };
  dates: { du: Date; au: Date };
  arrival: { date: Date; time: string; preference: string; preciseTime: string };
  departure: { date: Date; time: string; preference: string; preciseTime: string };
  hotel: { proche: string };
  needs: { carteSIM: boolean; ordinateurVoyage: boolean };
  status: 'draft' | 'sent' | 'validated';
  comments: any[];
}

export function HomePage() {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  // Mock data
  const travelers: Traveler[] = [
    {
      id: "1",
      name: "Marie Dubois",
      email: "marie.dubois@company.com",
      avatar: "/avatars/marie.jpg",
      department: "Commercial",
      currentTrips: 2,
      totalTrips: 15
    },
    {
      id: "2", 
      name: "Pierre Martin",
      email: "pierre.martin@company.com",
      department: "Marketing",
      currentTrips: 1,
      totalTrips: 8
    },
    {
      id: "3",
      name: "Sophie Laurent",
      email: "sophie.laurent@company.com", 
      department: "R&D",
      currentTrips: 0,
      totalTrips: 12
    }
  ];

  const travelBatches: TravelBatch[] = [
    {
      id: "1",
      name: "Salon Tech Paris 2024",
      destination: "Paris, France",
      travelers: [travelers[0], travelers[1]],
      startDate: new Date(2024, 2, 15),
      endDate: new Date(2024, 2, 18),
      status: "confirmed",
      budget: 8500
    },
    {
      id: "2",
      name: "Visite Client London",
      destination: "Londres, UK", 
      travelers: [travelers[2]],
      startDate: new Date(2024, 2, 22),
      endDate: new Date(2024, 2, 24),
      status: "planning",
      budget: 3200
    },
    {
      id: "3",
      name: "Conférence Berlin",
      destination: "Berlin, Allemagne",
      travelers: [travelers[0]],
      startDate: new Date(2024, 3, 5),
      endDate: new Date(2024, 3, 7),
      status: "in-progress",
      budget: 4100
    }
  ];

  // Mock data for travelers compatible with the table
  const travelersForTable: Record<string, Array<{id: string; name: string; role: string; status: 'confirmed' | 'pending' | 'declined'}>> = {
    "1": [
      { id: "t1", name: "Marie Dubois", role: "Chef de projet", status: "confirmed" },
      { id: "t2", name: "Pierre Martin", role: "Développeur", status: "confirmed" }
    ],
    "2": [
      { id: "t3", name: "Sophie Laurent", role: "Designer", status: "confirmed" }
    ],
    "3": [
      { id: "t4", name: "Marie Dubois", role: "Chef de projet", status: "confirmed" }
    ]
  };

  // Convert travel batches to travel requests format for the table
  const convertBatchesToRequests = (): TravelRequestFromBatch[] => {
    return travelBatches.map(batch => ({
      id: batch.id,
      purpose: batch.name.toLowerCase().includes('salon') ? 'salon' : 
               batch.name.toLowerCase().includes('visite') ? 'visite-client' : 'autres',
      location: { 
        quartier: '', 
        ville: batch.destination.split(',')[0].trim(), 
        pays: batch.destination.split(',')[1]?.trim() || ''
      },
      dates: { du: batch.startDate, au: batch.endDate },
      arrival: { date: batch.startDate, time: "09:00", preference: "matin", preciseTime: "08:30" },
      departure: { date: batch.endDate, time: "17:00", preference: "soir", preciseTime: "18:00" },
      hotel: { proche: "Centre-ville" },
      needs: { carteSIM: Math.random() > 0.5, ordinateurVoyage: Math.random() > 0.5 },
      status: batch.status === 'planning' ? 'draft' : 
              batch.status === 'confirmed' ? 'sent' : 'validated',
      comments: []
    }));
  };

  const stats = {
    totalRequests: 24,
    pending: 6,
    confirmed: 15,
    completed: 3,
    totalBudget: 125000,
    activeTravelers: 8
  };

  const getStatusIcon = (status: TravelBatch['status']) => {
    switch (status) {
      case 'planning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-accent" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getStatusLabel = (status: TravelBatch['status']) => {
    switch (status) {
      case 'planning': return 'Planification';
      case 'confirmed': return 'Confirmé';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
    }
  };

  const getStatusBadge = (status: TravelBatch['status']) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-warning text-warning-foreground">Planification</Badge>;
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmé</Badge>;
      case 'in-progress':
        return <Badge className="bg-accent text-accent-foreground">En cours</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminé</Badge>;
    }
  };

  // Generate calendar view
  const generateCalendarWeeks = () => {
    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 });
    const weeks = [];
    
    for (let i = 0; i < 4; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = addDays(startDate, i * 7 + j);
        const dayBatches = travelBatches.filter(batch => {
          const batchStart = batch.startDate;
          const batchEnd = batch.endDate;
          return date >= batchStart && date <= batchEnd;
        });
        
        week.push({
          date,
          batches: dayBatches,
          isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        });
      }
      weeks.push(week);
    }
    return weeks;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Travel Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Tableau de bord des déplacements professionnels
            </p>
          </div>
          
          <Link to="/new-request">
            <Button className="bg-gradient-accent shadow-glow hover:shadow-elegant transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Demandes</p>
                  <p className="text-3xl font-bold text-primary">{stats.totalRequests}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Plane className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Voyageurs actifs</p>
                  <p className="text-3xl font-bold text-accent">{stats.activeTravelers}</p>
                </div>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget utilisé</p>
                  <p className="text-2xl font-bold text-primary">{(stats.totalBudget / 1000).toFixed(0)}k€</p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">72% du budget annuel</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Travel Batches and Views */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Lots de voyage
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <Table className="h-4 w-4 mr-1" />
                      Tableau
                    </Button>
                    <Button
                      variant={viewMode === 'calendar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('calendar')}
                    >
                      <CalendarDays className="h-4 w-4 mr-1" />
                      Calendrier
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'table' ? (
                  <TravelTableView 
                    requests={convertBatchesToRequests() as any} 
                    travelers={travelersForTable} 
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
                      <div>Lun</div>
                      <div>Mar</div>
                      <div>Mer</div>
                      <div>Jeu</div>
                      <div>Ven</div>
                      <div>Sam</div>
                      <div>Dim</div>
                    </div>
                    
                    {generateCalendarWeeks().map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`
                              min-h-[80px] p-2 border rounded-lg text-sm
                              ${day.isToday ? 'bg-accent/10 border-accent' : 'border-border'}
                              ${day.batches.length > 0 ? 'bg-muted/30' : ''}
                            `}
                          >
                            <div className={`font-medium mb-1 ${day.isToday ? 'text-accent' : ''}`}>
                              {format(day.date, 'd')}
                            </div>
                            {day.batches.map((batch) => (
                              <div
                                key={batch.id}
                                className="text-xs p-1 bg-primary/10 text-primary rounded mb-1 truncate"
                                title={batch.name}
                              >
                                {batch.name}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Travelers List */}
          <div className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Voyageurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {travelers.map((traveler) => (
                  <div key={traveler.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar>
                      <AvatarFallback>
                        {traveler.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{traveler.name}</p>
                      <p className="text-xs text-muted-foreground">{traveler.department}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {traveler.currentTrips > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {traveler.currentTrips} en cours
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {traveler.totalTrips} voyages
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-primary">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/requests">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Voir toutes mes demandes
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les voyageurs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rapports et analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}