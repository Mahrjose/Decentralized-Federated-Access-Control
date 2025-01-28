FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set up Python environment
WORKDIR /app/FL/scripts
COPY FL/scripts/requirements.txt .
RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install -r requirements.txt

# Set up Node.js environment
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expose ports
EXPOSE ${NODE_PORT}
EXPOSE ${FL_SERVER_PORT}  

# Start both Node.js and federated learning server
CMD ["sh", "-c", "node src/server.js & python3 FL/scripts/fl_server.py"]