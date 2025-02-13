FROM node:18

WORKDIR /app

COPY . /app

RUN chown -R node /app

RUN npm install --global yo generator-code

CMD ["bash"]