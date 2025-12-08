VENV_PATH := .venv

PYTHON := $(VENV_PATH)/bin/python
PIP := $(VENV_PATH)/bin/pip
STREAMLIT := $(VENV_PATH)/bin/streamlit
REQUIREMENTS := requirements.txt

default: run

venv:
	@python3 -m venv $(VENV_PATH)

install: venv
	@$(PIP) install --disable-pip-version-check -q --upgrade pip
	@$(PIP) install --disable-pip-version-check -q -r $(REQUIREMENTS)

run:
	@$(STREAMLIT) run app.py
