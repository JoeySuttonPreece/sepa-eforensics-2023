FROM debian:latest

RUN apt-get update

RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash
RUN apt-get install -y nodejs

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

#This is for when we actually use electron, not including it here for time saving
RUN apt-get install chromium -y
RUN apt-get install sleuthkit -y

COPY * /project
WORKDIR /project

RUN pnpm install
