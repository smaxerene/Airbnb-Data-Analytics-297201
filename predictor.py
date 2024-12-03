import pandas as pd
import sys
from sklearn import preprocessing, neighbors
import json

dir_path = "datasets"

def get_rooms():
    file_path = f"{dir_path}/rooms.csv"
    return pd.read_csv(file_path, index_col=0)
def get_prices(id):
    file_path = f"{dir_path}/{id}.csv"
    return pd.read_csv(file_path, index_col='date', parse_dates=True)
def get_room_df_dict(ids):
    room_df_dict = {}
    for id in ids:
        room_df_dict[id] = get_prices(id)
    return room_df_dict
def predict(features, date, k=5):
    columns_to_take = []
    X = []
    y = []
    x = []
    if "guests" in features:
        columns_to_take.append("guests")
        x.append(features["guests"])
    if "bedrooms" in features:
        columns_to_take.append("bedrooms")
        x.append(features["bedrooms"])
    if "beds" in features:
        columns_to_take.append("beds")
        x.append(features["beds"])
    if "baths" in features:
        columns_to_take.append("baths")
        x.append(features["baths"])
    for id in rooms_df.index:
        room_df = room_df_dict[id]
        price = room_df.loc[date]["price"]
        if price > 0:
            X.append(rooms_df.loc[id][columns_to_take].to_list())
            y.append([price])
    for count in range(0, round(len(rooms_df) / 10)):
        min = y[0][0]
        min_index = 0
        for i, price_list in enumerate(y):
            price = price_list[0]
            if price < min:
                min = price
                min_index = i
        del X[min_index]
        del y[min_index]
        max = y[0][0]
        max_index = 0
        for i, price_list in enumerate(y):
            price = price_list[0]
            if price > max:
                max = price
                max_index = i
        del X[max_index]
        del y[max_index]
    X = preprocessing.MinMaxScaler().fit_transform(X)
    if k > len(X):
        k = len(X)
    knn = neighbors.KNeighborsRegressor(k, weights="distance")
    return round(knn.fit(X, y).predict([x])[0][0])

rooms_df = get_rooms()
room_df_dict = get_room_df_dict(rooms_df.index)

parameter = json.loads(sys.argv[1])

for id in room_df_dict:
    room0 = room_df_dict[id]
    break

earliest = room0.index[0]
latest = room0.index[len(room0.index)-1]
date = pd.Timestamp(parameter["date"])

if date < earliest:
  print(f"Error: Date must be later than or equal to {earliest.strftime("%Y-%m-%d")}")
elif date > latest:
  print(f"Error: Date must be earlier than or equal to {latest.strftime("%Y-%m-%d")}")
else:
    price = predict(parameter["features"], parameter["date"])
    print(price)