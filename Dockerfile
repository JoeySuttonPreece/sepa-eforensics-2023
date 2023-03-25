FROM debian:latest

RUN apt-get update && \
    apt-get upgrade -y

RUN apt-get install x11-apps python3 python3-tk python3-setuptools python3-dev build-essential automake libtool git -y

RUN git clone https://github.com/py4n6/pytsk
WORKDIR pytsk
RUN python3 setup.py update && \
    python3 setup.py build && \
    python3 setup.py install

WORKDIR /src
