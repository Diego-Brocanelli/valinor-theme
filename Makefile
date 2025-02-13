build:
	docker build -t valinor-vscode-theme .

sh:
	docker run --privileged --rm -it -v .:/app valinor-vscode-theme bash
