import sys
import pandas as pd
from scipy.stats import poisson

home = sys.argv[1]
away = sys.argv[2]

# print("first",first)
# print("second",second)

df_data_input = pd.read_csv('FootballTeamDetail.csv')

df_home_input = df_data_input[['HomeTeam', 'Goal', 'Lost']]
df_away_input = df_data_input[['AwayTeam', 'Goal', 'Lost']]

df_home_input = df_home_input.rename(columns={'HomeTeam':'Team', 'Goal': 'GoalsScored', 'Lost': 'GoalsConceded'})
df_away_input = df_away_input.rename(columns={'AwayTeam':'Team', 'Goal': 'GoalsConceded', 'Lost': 'GoalsScored'})

df_team_strength_input = pd.concat([df_home_input, df_away_input], ignore_index=True).groupby(['Team']).mean()

def predict_points(home, away):
    if home in df_team_strength_input.index and away in df_team_strength_input.index:
        # goals_scored * goals_conceded

        lamb_home = df_team_strength_input.at[home,'GoalsScored'] * df_team_strength_input.at[away,'GoalsConceded']
        lamb_away = df_team_strength_input.at[away,'GoalsScored'] * df_team_strength_input.at[home,'GoalsConceded']
        # print(lamb_home,"-",lamb_away)
        prob_home, prob_away, prob_draw = 0, 0, 0
        for x in range(0,11): #number of goals home team
            for y in range(0, 11): #number of goals away team
                p = poisson.pmf(x, lamb_home) * poisson.pmf(y, lamb_away)
                if x == y:
                    prob_draw += p
                elif x > y:
                    prob_home += p
                else:
                    prob_away += p
        
        points_home = 3 * prob_home + prob_draw
        points_away = 3 * prob_away + prob_draw
        if points_home > points_away:
            return (round(points_home), round(points_away), home, away, "winer "+home)
        if points_home < points_away:
            return (round(points_away), round(points_home), away, home, "winer "+away)
        if points_home == points_away:
            return (round(points_home), round(points_away), "Draw")

    else:
        return (0, 0)

if(predict_points(home, away)[0] == predict_points(home, away)[1]):
    print("Draw")
    print("score ",predict_points(home, away)[0])

else:
    print("winner is ",predict_points(home, away)[2],"score ",predict_points(home, away)[0])
    print("loser is ",predict_points(home, away)[3],"score ",predict_points(home, away)[1])


# print("NetteN",predict_points('Slovakia', 'Sweden')[0])