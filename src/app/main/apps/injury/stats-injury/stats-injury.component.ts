import { Component, OnInit } from "@angular/core";
import { ServiceInjury } from "../service-injury.service";
import Chart from "chart.js";
import { TeamService } from "app/team-management/team.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { MeetingCalenderService } from "../../meeting-calender/meeting-calender/Service/meeting-calender.service";

@Component({
  selector: "app-stats-injury",
  templateUrl: "./stats-injury.component.html",
  styleUrls: ["./stats-injury.component.scss"],
})
export class StatsInjuryComponent implements OnInit {
  injuryTypeStats: any[] = [];
  donutChart: Chart;
  recoveryStats: any[] = [];
  barChart: Chart;
  yearStats: any[] = [];
  selectedYear: number;
  matchData: any;
  months: string[] = [];
  sessionStats: any = {};

  meetingConfirmationStats: any[] = [];
  meetingMonthStats: any[] = [];
  donutChartMeeting: Chart;
  monthStats: any[] = [];
  lineChart: Chart;
  selectedYear2: number;

  constructor(
    private injuryService: ServiceInjury,
    private teamService: TeamService,
    private playerService: MeetingCalenderService


  ) {}

  ngOnInit(): void {
    this.selectedYear = new Date().getFullYear();
    this.fetchYearStats();
    this.fetchInjuryTypeStats();
    this.fetchRecoveryStats();
    this.fetchMatchData();
    this.fetchSessionStats();

    this.fetchMeetingConfirmationStats();
    this.selectedYear2 = new Date().getFullYear();
    this.fetchMonthStats(this.selectedYear2);
    
  }

  fetchInjuryTypeStats(): void {
    this.injuryService.getInjuriesByTypeStats().subscribe(
      (data) => {
        this.injuryTypeStats = data;
        this.createDonutChart();
      },
      (error) => {
        console.error("Error fetching injury type stats:", error);
      }
    );
  }

  createDonutChart(): void {
    const ctx = document.getElementById("donutChart") as HTMLCanvasElement;
    this.donutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: this.injuryTypeStats.map((stat) => stat.type),
        datasets: [
          {
            label: "Number of injuries",
            data: this.injuryTypeStats.map((stat) => stat.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  fetchRecoveryStats(): void {
    this.injuryService.getInjuriesByRecoveryStatusStats().subscribe(
      (data) => {
        this.recoveryStats = data;
        this.createBarChart();
      },
      (error) => {
        console.error("Error fetching recovery stats:", error);
      }
    );
  }

  createBarChart(): void {
    const ctx = document.getElementById("barChart") as HTMLCanvasElement;
    this.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["In Progress", "Recovered", "In Rehabilitation"],
        datasets: [
          {
            label: "Number of injuries",
            data: this.recoveryStats.map((stat) => stat.count),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  fetchYearStats(): void {
    this.injuryService.getInjuriesByYearStats(this.selectedYear).subscribe(
      (data) => {
        this.yearStats = data || [];
        this.createStackedBarChart();
      },
      (error) => {
        console.error("Error fetching year stats:", error);
      }
    );
  }

  createStackedBarChart(): void {
    if (!this.yearStats || this.yearStats.length === 0) {
      console.warn("No data available for year stats.");
      return;
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dataByMonth = monthNames.map((month, index) => {
      const monthStats = this.yearStats.find(
        (stat) => stat.month === index + 1
      );
      const monthlyCounts = monthStats ? monthStats.count : 0;
      return { month, monthlyCounts };
    });

    const ctx = document.getElementById("lineChart") as HTMLCanvasElement;
    this.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dataByMonth.map((stat) => stat.month),
        datasets: [
          {
            label: `Number of injuries in ${this.selectedYear}`,
            data: dataByMonth.map((stat) => stat.monthlyCounts),
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  //match

  createCharts(): void {
    this.createBarChartMatch();
  }

  fetchMatchData(): void {
    this.teamService.getMatchDistribution().subscribe(
      (data) => {
        // Group match counts by month
        const matchesByMonth = {};
        Object.keys(data.matchesByDate).forEach((date) => {
          const month = date.substring(0, 7); // Extract year-month part of the date
          if (!matchesByMonth[month]) {
            matchesByMonth[month] = 0;
          }
          matchesByMonth[month] += data.matchesByDate[date];
        });
        // Convert object to array of objects for easier chart creation
        this.matchData = Object.keys(matchesByMonth).map((month) => ({
          month,
          count: matchesByMonth[month],
        }));
        this.createCharts();
      },
      (error) => {
        console.error("Error fetching match data:", error);
      }
    );
  }

  createBarChartMatch(): void {
    const ctx = document.getElementById("barChartMatch") as HTMLCanvasElement;
    this.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this.matchData.map((data) => data.month), // Use months as labels
        datasets: [
          {
            label: "Number of Matches",
            data: this.matchData.map((data) => data.count), // Use match counts per month as data
            backgroundColor: "rgba(153, 102, 255, 0.7)", // Change background color to purple
            borderColor: "rgba(153, 102, 255, 1)", // Change border color to darker purple
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  //session
  fetchSessionStats(): void {
    this.teamService.getAllSessions().subscribe(
      (stats: any) => {
        this.createCombinedBarChart(stats.sessionsPerMonth);
      },
      (error: any) => {
        console.error("Error fetching session stats:", error);
      }
    );
  }

  createPieChartsForAllMonths(stats: any): void {
    const months = Object.keys(stats);
    months.forEach((month) => {
      const statsForMonth = stats[month];
      this.createBarChartSession(month, statsForMonth);
    });
  }

  createBarChartSession(month: string, stats: any): void {
    const container = document.getElementById("chartContainer");
    if (!container) {
      console.error("Chart container not found.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = `barChartSession-${month}`;
    container.appendChild(canvas);

    console.log(`Created bar chart for ${month}`);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context for canvas.");
      return;
    }

    const labels = Object.keys(stats);
    const data = Object.values(stats);

    console.log("Labels:", labels);
    console.log("Data:", data);

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Number of Training Sessions",
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  createCombinedBarChart(stats: any): void {
    const container = document.getElementById("chartContainer");
    if (!container) {
      console.error("Chart container not found.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = `combinedBarChart`;
    container.appendChild(canvas);

    console.log(`Created combined bar chart`);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context for canvas.");
      return;
    }

    const labels: string[] = [];
    const data: number[] = [];
    for (const month in stats) {
      if (stats.hasOwnProperty(month)) {
        labels.push(month);
        data.push(stats[month]);
      }
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Number of Training Sessions",
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
   //meetings 
   fetchMeetingConfirmationStats(): void {
    this.playerService.getMeetingsByConfirmationStatusStats().subscribe(
      (data) => {
        this.meetingConfirmationStats = data;
        this.createDonutChartMeeting();
      },
      (error) => {
        console.error("Error fetching meeting confirmation stats:", error);
      }
    );
  }
  
  createDonutChartMeeting(): void {
    const ctx = document.getElementById("donutChartMeeting") as HTMLCanvasElement;
    const colorsMap = {
      Confirmed: "rgba(75, 192, 192, 0.7)",
      Pending: "rgba(153, 102, 255, 0.7)"
    };
  
    this.donutChartMeeting = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: this.meetingConfirmationStats.map((stat) => stat.confirmation_status),
        datasets: [
          {
            label: "Number of meetings",
            data: this.meetingConfirmationStats.map((stat) => stat.count),
            backgroundColor: this.meetingConfirmationStats.map((stat) => colorsMap[stat.confirmation_status]),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
  fetchMonthStats(year: number): void {
    this.playerService.getMeetingsByMonthStats(year).subscribe(
      (data) => {
        console.log("Month stats data:", data);
        // Traiter les données reçues pour les adapter au format attendu par le graphique
        this.monthStats = data.map(item => ({
          monthName: this.getMonthName(item._id.month), // Convertir le numéro du mois en nom du mois
          count: item.totalMeetings // Utiliser le nombre total de réunions
        }));
        this.createLineChart();
      },
      (error) => {
        console.error("Error fetching month stats:", error);
      }
    );
  }
   
  getMonthName(month: number): string {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  }
  

  createLineChart(): void {
    const ctx = document.getElementById("lineChart2") as HTMLCanvasElement;
    this.lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.monthStats.map((stat) => stat.monthName), // Utiliser les noms des mois comme étiquettes
        datasets: [
          {
            label: "Number of meetings",
            data: this.monthStats.map((stat) => stat.count), // Utiliser le nombre de réunions par mois comme données
            fill: false,
            borderColor: "rgba(255, 99, 132, 1)", // Couleur rouge
            lineTension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      },
    });
  }

  
  onYearChange(year: number): void {
    this.fetchMonthStats(year);
  }
}
  
