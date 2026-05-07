import pandas as pd
import numpy as np
import json
import random
from sklearn.linear_model import Ridge
from sklearn.preprocessing import OneHotEncoder
import os

# 1. Generate Synthetic Dataset
np.random.seed(42)
random.seed(42)

reaction_types = ["ethanol-to-jet", "methanol-synthesis", "co2-reduction", "syngas-to-ethanol", "biomass-to-hmf"]
metals = ["Ni", "Cu", "Co", "In", "Pd", "Fe", "Ru", "Ag", "Rh", "Pt", "Au", "Sn"]
supports = ["HZSM-5", "SAPO-34", "CeO2", "SiO2", "Al2O3", "TiO2", "MgO", "C", "BEA"]

data = []
for _ in range(2000):
    rxn = random.choice(reaction_types)
    metal = random.choice(metals)
    support = random.choice(supports)
    temp = random.uniform(150, 800)
    pressure = random.uniform(1, 100)
    
    # Heuristic for activity (just to make the ML learn something logical)
    activity = 0.5
    if rxn == "ethanol-to-jet" and metal in ["Ni", "Co"] and support in ["HZSM-5", "BEA"]: activity += 0.3
    if rxn == "co2-reduction" and metal in ["Cu", "In", "Ag"]: activity += 0.35
    if temp > 300 and temp < 500: activity += 0.1
    if temp > 700: activity -= 0.2
    
    # Add noise
    activity += np.random.normal(0, 0.05)
    activity = max(0.1, min(0.99, activity))
    
    selectivity = activity + np.random.normal(0, 0.05)
    selectivity = max(0.1, min(0.99, selectivity))
    
    data.append([rxn, metal, support, temp, pressure, activity, selectivity])

df = pd.DataFrame(data, columns=["Reaction", "Metal", "Support", "Temperature", "Pressure", "Activity", "Selectivity"])
os.makedirs("ml_pipeline", exist_ok=True)
df.to_csv("ml_pipeline/catalyst_dataset.csv", index=False)
print("Generated ml_pipeline/catalyst_dataset.csv with 2000 records.")

# 2. Train ML Model
X_cat = df[["Reaction", "Metal", "Support"]]
X_num = df[["Temperature", "Pressure"]]
y_act = df["Activity"]
y_sel = df["Selectivity"]

encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_cat_encoded = encoder.fit_transform(X_cat)
feature_names = encoder.get_feature_names_out(["Reaction", "Metal", "Support"]).tolist()

X_final = np.hstack([X_cat_encoded, X_num.values])
feature_names.extend(["Temperature", "Pressure"])

model_act = Ridge(alpha=1.0)
model_act.fit(X_final, y_act)

model_sel = Ridge(alpha=1.0)
model_sel.fit(X_final, y_sel)

# 3. Export Weights to JSON for Node.js Inference
model_data = {
    "features": feature_names,
    "categories": {
        "Reaction": encoder.categories_[0].tolist(),
        "Metal": encoder.categories_[1].tolist(),
        "Support": encoder.categories_[2].tolist()
    },
    "activity_model": {
        "intercept": float(model_act.intercept_),
        "coefficients": model_act.coef_.tolist()
    },
    "selectivity_model": {
        "intercept": float(model_sel.intercept_),
        "coefficients": model_sel.coef_.tolist()
    }
}

with open("artifacts/api-server/src/lib/ml_weights.json", "w") as f:
    json.dump(model_data, f, indent=2)

print("Successfully trained Ridge Regression models and exported weights to artifacts/api-server/src/lib/ml_weights.json")
