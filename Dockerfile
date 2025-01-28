FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip lsof
RUN apt-get install -y python3.11-venv

# Set up Python environment
WORKDIR /app/FL/scripts
RUN python3 -m venv venv
ENV PATH="/app/FL/scripts/venv/bin:$PATH"
COPY FL/scripts/requirements.txt .
RUN python3 -m pip install --upgrade pip
RUN python3 -m pip install -r requirements.txt

# Set up Node.js environment
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

COPY start_node.sh /app/start_node.sh
RUN chmod +x /app/start_node.sh

# Expose ports
EXPOSE ${NODE_PORT}
EXPOSE ${FL_SERVER_PORT}  

# Start both Node.js and federated learning server
CMD ["sh", "/app/start_node.sh"]