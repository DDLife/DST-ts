#!/bin/sh
# see [git - html export different branch - Stack Overflow](https://stackoverflow.com/questions/9965884/html-export-different-branch)
usage() {
    cat <<EOF
Usage: $0 [options] [--] <path_to_exported_html_files>

Arguments:

  -h, --help
    Display this usage message and exit.

  -b <branch>, --branch=<branch>, --branch <branch>
    Commit the files to the given branch.  If the branch doesn't
    exist, a new root (parentless) commit is created.
    Defaults to: ${DEFAULT_BRANCH}

  --
    Treat the remaining arguments as path names.  Useful if the path
    name might begin with '-'.

  <path_to_exported_html_files>
    Directory containing the html files exported by org-mode.  If the
    path begins with '-', it will be treated as an option unless it
    comes after the '--' option.
EOF
}

DEFAULT_BRANCH=gh-pages

# handy logging and error handling functions
log() { printf '%s\n' "$*"; }
warn() { log "WARNING: $*" >&2; }
error() { log "ERROR: $*" >&2; }
fatal() { error "$*"; exit 1; }
try() { "$@" || fatal "'$@' failed"; }
usage_fatal() { error "$*"; usage >&2; exit 1; }

# parse options
BRANCH=${DEFAULT_BRANCH}
while [ "$#" -gt 0 ]; do
    arg=$1
    # the quotes around the equals signs in the case patterns below
    # are to work around a bug in emacs' syntax parsing
    case $1 in
        -h|--help) usage; exit 0;;
        -b|--branch) shift; BRANCH=$1;;
        --branch'='*) BRANCH=${1#--branch=};;
        --) shift; break;;
        -*) usage_fatal "unknown option: '$1'";;
        *) break;; # reached the path
    esac
    shift || usage_fatal "option '${arg}' requires a value"
done
[ "$#" -gt 0 ] || usage_fatal "must specify a directory"
dir=$1; shift
dir=$(cd "${dir}" && pwd -P) \
    || fatal "unable to convert ${dir} to an absolute path"
[ "$#" -eq 0 ] || usage_fatal "unknown option: $1"
[ -d "${dir}" ] || usage_fatal "${dir} is not a directory"

# sanity check:  make sure ${BRANCH} isn't currently checked out
# (otherwise 'git status' will show modified files when this script is
# done)
CURRENT_BRANCH=$(try git symbolic-ref HEAD) || exit 1
case ${CURRENT_BRANCH} in
    refs/heads/"${BRANCH}") fatal "${BRANCH} must not be checked out";;
esac

# set up git
GIT_DIR=$(git rev-parse --git-dir) \
    || fatal "unable to locate .git directory"
GIT_DIR=$(cd "${GIT_DIR}" && pwd -P) \
    || fatal "unable to convert git directory to an absolute path"
GIT_INDEX_FILE=$(mktemp -u) \
    || fatal "unable to generate a temporary file name"
export GIT_DIR
export GIT_INDEX_FILE
export GIT_WORK_TREE="${dir}"

# stage the files
try cd "${dir}"
try git add -Af .

# commit the files
PARENT=$(git rev-parse --verify -q refs/heads/"${BRANCH}") \
    || warn "creating a new branch named ${BRANCH}"
TREE=$(try git write-tree) || exit 1
COMMIT_MESSAGE="Import files from ${dir}"
COMMIT=$(
    printf '%s\n' "${COMMIT_MESSAGE}" |
    try git commit-tree "${TREE}" ${PARENT:+-p "${PARENT}"}
) || exit 1

# update the branch to point to the result
try git update-ref refs/heads/"${BRANCH}" -m "commit: ${COMMIT_MESSAGE}" \
    "${COMMIT}"

# clean up
try rm -f "${GIT_INDEX_FILE}"

log "committed ${COMMIT} to ${BRANCH}"