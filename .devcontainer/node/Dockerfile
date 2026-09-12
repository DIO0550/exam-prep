FROM ubuntu:24.04

# Node.js のメジャーバージョン
ARG NODE_VERSION=24
# pnpm のバージョン。package.json の packageManager と揃える。
# ずれていても pnpm 側が packageManager の版へ切り替えるが、その分だけ起動が遅くなる。
ARG PNPM_VERSION=12.3.4
ARG USERNAME=vscode

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8

# iptables / ipset / dnsutils / aggregate は init-firewall.sh が使う。
# fonts-noto-cjk: ubuntu:24.04 には CJK フォントが無く、ブラウザでの目視確認で
# 日本語が豆腐(□)になる。

# 開発ユーザー(vscode)には sudo を与えない。与えると firewall を張り替えられてしまい、
# 許可リストが「自分で外せる制限」になる。特権が要る初期化は entrypoint.sh が root で行う。
RUN apt-get update \
    && apt-get install -y \
        curl \
        ca-certificates \
        fonts-noto-cjk \
        gnupg \
        git \
        jq \
        tmux \
        vim-tiny \
        build-essential \
        file \
        wget \
        zip \
        unzip \
        iptables \
        ipset \
        dnsutils \
        aggregate \
    && useradd -m -s /bin/bash $USERNAME \
    && install -d -m 0755 /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_VERSION}.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        -o /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y nodejs gh \
    && rm -rf /var/lib/apt/lists/*

# pnpm はバージョンを固定して入れる。
# npm は依存のライフサイクルスクリプトを既定で実行するので止める
# （pnpm 10 以降は既定で実行せず、必要なものだけ onlyBuiltDependencies で許可する）。
RUN npm install -g pnpm@${PNPM_VERSION} \
    && npm config set --global ignore-scripts true \
    && pnpm --version

# クールタイムのグローバル設定。リポジトリ内では pnpm-workspace.yaml の 10080 が優先され、
# こちらは pnpm dlx などリポジトリの外での解決に効く。設定は実行ユーザーのホーム配下に
# 置かれるので、root ではなく vscode で書く。
# pnpm config set --global は使わない。書かれる rc 形式は pnpm 11 以降では
# pnpm config get で読めるだけで解決には効かず、設定したつもりの状態になる。
USER $USERNAME
RUN mkdir -p "$HOME/.config/pnpm" \
    && echo "minimumReleaseAge: 10080" >> "$HOME/.config/pnpm/config.yaml"

# 最終 USER を root に戻す。コンテナ本体のプロセス(entrypoint.sh)が iptables を
# 操作するため。開発セッションは devcontainer.json の remoteUser: vscode で動く。
USER root
WORKDIR /workspace
