build:
	docker build -t valinor-vscode-theme .

sh:
	docker run --privileged --rm -it -v .:/app valinor-vscode-theme bash

init:
	git submodule update --init --recursive

update-icons:
	git submodule update --remote icons/zed-src
	git submodule update --remote icons/symbols
	git submodule update --remote icons/fluent
	@echo "Catppuccin: atualizar manualmente copiando os theme.json gerados"