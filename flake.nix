{
  description = "Bun devShell";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShells.ci = pkgs.mkShell {
        name = "bun-ci";

        buildInputs = [
          pkgs.bun
          pkgs.biome
        ];
      };

      devShells.default = pkgs.mkShell {
        name = "bun";

        buildInputs = [
          pkgs.bun
          pkgs.biome
          pkgs.nodePackages.vscode-langservers-extracted
					pkgs.typescript-go
        ];
      };
    });
}
