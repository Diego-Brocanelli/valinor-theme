.PHONY: build sh init install theme validate screenshots package update-icons

# Imagem Docker com Node 22 (opcional: com Node local basta "make install").
build:
	docker build -t valinor-vscode-theme .

sh:
	docker run --rm -it -u "$$(id -u):$$(id -g)" -v "$$(pwd)":/app valinor-vscode-theme bash

init:
	git submodule update --init --recursive

install:
	npm ci

theme:
	npm run build

validate:
	npm run validate

screenshots:
	npm run screenshots

package:
	npm run package

update-icons:
	git submodule update --remote icons/symbols
	git submodule update --remote icons/fluent
	npm run vendor:lucide
	@echo "Catppuccin: atualizar manualmente copiando os theme.json gerados pela extensão."
